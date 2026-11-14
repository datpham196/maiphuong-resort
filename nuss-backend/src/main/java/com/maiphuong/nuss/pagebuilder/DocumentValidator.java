package com.maiphuong.nuss.pagebuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class DocumentValidator {

	public static final String EMPTY_DOCUMENT =
			"{\"version\":1,\"root\":{\"id\":\"root\",\"type\":\"root\",\"props\":{},\"children\":[]}}";

	private static final Set<String> ALLOWED_TYPES = Set.of(
			"root",
			"heading",
			"text",
			"image",
			"mediaText",
			"imageGallery",
			"slider",
			"video",
			"button",
			"divider",
			"spacer",
			"columns",
			"column"
	);

	private static final Set<String> CONTAINER_TYPES = Set.of("root", "columns", "column");
	private static final int MAX_DEPTH = 3;
	private static final int MAX_BLOCKS = 150;

	private final ObjectMapper objectMapper;

	public DocumentValidator(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public void validateOrThrow(String documentJson) {
		List<Map<String, String>> errors = validate(documentJson);
		if (!errors.isEmpty()) {
			throw new DocumentValidationException(errors);
		}
	}

	public List<Map<String, String>> validate(String documentJson) {
		List<Map<String, String>> errors = new ArrayList<>();
		if (documentJson == null || documentJson.isBlank()) {
			errors.add(error("$", "DOCUMENT_REQUIRED", "Document is required"));
			return errors;
		}
		JsonNode rootDoc;
		try {
			rootDoc = objectMapper.readTree(documentJson);
		} catch (Exception ex) {
			errors.add(error("$", "DOCUMENT_PARSE", "Document JSON could not be parsed"));
			return errors;
		}
		if (!rootDoc.has("version") || !rootDoc.get("version").canConvertToInt()) {
			errors.add(error("$.version", "VERSION_REQUIRED", "Document version is required"));
		}
		JsonNode root = rootDoc.get("root");
		if (root == null || !root.isObject()) {
			errors.add(error("$.root", "ROOT_REQUIRED", "Document root is required"));
			return errors;
		}
		int[] blockCount = {0};
		walk(root, "$.root", 0, false, blockCount, errors);
		if (blockCount[0] > MAX_BLOCKS) {
			errors.add(error("$", "TOO_MANY_BLOCKS", "Document exceeds max block count (" + MAX_BLOCKS + ")"));
		}
		return errors;
	}

	private void walk(
			JsonNode node,
			String path,
			int depth,
			boolean insideColumns,
			int[] blockCount,
			List<Map<String, String>> errors
	) {
		blockCount[0]++;
		if (depth > MAX_DEPTH) {
			errors.add(error(path, "MAX_DEPTH", "Block nesting exceeds max depth (" + MAX_DEPTH + ")"));
			return;
		}
		String type = text(node, "type");
		if (type == null || !ALLOWED_TYPES.contains(type)) {
			errors.add(error(path + ".type", "TYPE_INVALID", "Unknown or missing block type"));
			return;
		}
		String id = text(node, "id");
		if (id == null || id.isBlank()) {
			errors.add(error(path + ".id", "ID_REQUIRED", "Block id is required"));
		}
		if (!node.has("props") || !node.get("props").isObject()) {
			errors.add(error(path + ".props", "PROPS_REQUIRED", "Block props object is required"));
		}

		JsonNode children = node.get("children");
		boolean hasChildren = children != null && children.isArray() && !children.isEmpty();
		if (hasChildren && !CONTAINER_TYPES.contains(type)) {
			errors.add(error(path + ".children", "CHILDREN_NOT_ALLOWED", "This block type cannot have children"));
		}
		if ("columns".equals(type)) {
			if (insideColumns) {
				errors.add(error(path, "COLUMNS_NESTED", "Columns cannot be nested"));
			}
			if (children == null || !children.isArray()) {
				errors.add(error(path + ".children", "COLUMNS_CHILDREN", "Columns must have column children"));
			} else {
				for (int i = 0; i < children.size(); i++) {
					JsonNode child = children.get(i);
					String childType = text(child, "type");
					if (!"column".equals(childType)) {
						errors.add(error(path + ".children[" + i + "]", "COLUMN_REQUIRED", "Columns children must be column"));
					}
					walk(child, path + ".children[" + i + "]", depth + 1, true, blockCount, errors);
				}
			}
			return;
		}
		if ("column".equals(type) && !insideColumns && depth > 0) {
			// column must live under columns; root path only for root
		}
		validateLeafProps(type, node.get("props"), path, errors);

		if (children != null && children.isArray()) {
			for (int i = 0; i < children.size(); i++) {
				walk(children.get(i), path + ".children[" + i + "]", depth + 1, insideColumns, blockCount, errors);
			}
		}
	}

	private void validateLeafProps(String type, JsonNode props, String path, List<Map<String, String>> errors) {
		if (props == null || !props.isObject()) {
			return;
		}
		switch (type) {
			case "heading" -> {
				if (blank(props, "text")) {
					errors.add(error(path + ".props.text", "TEXT_REQUIRED", "Heading text is required"));
				}
			}
			case "text" -> {
				if (blank(props, "text")) {
					errors.add(error(path + ".props.text", "TEXT_REQUIRED", "Text content is required"));
				}
			}
			case "image" -> {
				if (blank(props, "src")) {
					errors.add(error(path + ".props.src", "SRC_REQUIRED", "Image src is required"));
				}
			}
			case "mediaText" -> {
				if (blank(props, "src")) {
					errors.add(error(path + ".props.src", "SRC_REQUIRED", "Media text image src is required"));
				}
				if (blank(props, "text")) {
					errors.add(error(path + ".props.text", "TEXT_REQUIRED", "Media text content is required"));
				}
			}
			case "button" -> {
				if (blank(props, "label")) {
					errors.add(error(path + ".props.label", "LABEL_REQUIRED", "Button label is required"));
				}
				if (blank(props, "href")) {
					errors.add(error(path + ".props.href", "HREF_REQUIRED", "Button href is required"));
				}
			}
			case "video" -> {
				if (blank(props, "url")) {
					errors.add(error(path + ".props.url", "URL_REQUIRED", "Video url is required"));
				}
			}
			case "imageGallery" -> {
				JsonNode images = props.get("images");
				if (images == null || !images.isArray() || images.isEmpty()) {
					errors.add(error(path + ".props.images", "IMAGES_REQUIRED", "Gallery needs at least one image"));
				} else {
					for (int i = 0; i < images.size(); i++) {
						if (blank(images.get(i), "src")) {
							errors.add(error(path + ".props.images[" + i + "].src", "SRC_REQUIRED", "Gallery image src is required"));
						}
					}
				}
			}
			case "slider" -> {
				JsonNode slides = props.get("slides");
				if (slides == null || !slides.isArray() || slides.isEmpty()) {
					errors.add(error(path + ".props.slides", "SLIDES_REQUIRED", "Slider needs at least one slide"));
				} else {
					for (int i = 0; i < slides.size(); i++) {
						if (blank(slides.get(i), "src")) {
							errors.add(error(path + ".props.slides[" + i + "].src", "SRC_REQUIRED", "Slide src is required"));
						}
					}
				}
			}
			default -> {
			}
		}
	}

	private static boolean blank(JsonNode props, String field) {
		if (props == null || !props.has(field) || props.get(field).isNull()) {
			return true;
		}
		String value = props.get(field).asText("");
		return value.isBlank();
	}

	private static String text(JsonNode node, String field) {
		if (node == null || !node.has(field) || node.get(field).isNull()) {
			return null;
		}
		return node.get(field).asText(null);
	}

	private static Map<String, String> error(String path, String code, String message) {
		return Map.of("path", path, "code", code, "message", message);
	}
}

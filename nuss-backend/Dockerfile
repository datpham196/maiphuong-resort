# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Use mirror settings to reduce Maven Central 429 on shared cloud builders
COPY .mvn/settings.xml /root/.m2/settings.xml

# Cache dependencies in a separate layer when pom.xml is unchanged
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -q -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/nuss-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Render assigns PORT — the app must listen on that port
ENTRYPOINT ["sh", "-c", "java -Xmx384m -jar app.jar --server.port=${PORT:-8080}"]

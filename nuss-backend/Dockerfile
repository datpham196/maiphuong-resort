# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/nuss-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Render assigns PORT — the app must listen on that port
ENTRYPOINT ["sh", "-c", "java -Xmx384m -jar app.jar --server.port=${PORT:-8080}"]

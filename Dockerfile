FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV SPRING_DATASOURCE_URL=jdbc:mysql://caboose.proxy.rlwy.net:27899/railway
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=LkZATpjRcnyJflueCBWHIfFGkguVQpBn
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
FROM maven:3.8-openjdk-17-slim AS build
WORKDIR /home/app
COPY src ./src
COPY pom.xml .
RUN mvn clean package

FROM openjdk:17-jdk-slim
COPY --from=build /home/app/target/bankmanagement.jar /usr/local/lib/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/local/lib/app.jar"]
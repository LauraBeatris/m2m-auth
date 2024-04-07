---
title: "Communication - Use cases"
---

# Use cases

This section outlines use cases in which applications have to support for secure and instant communication between services/machines.

### Table of contents

- [API Key Management](#api-key-management)
- [Service-to-Service Tokens](#service-to-service-tokens)
- [Authenticating services within CI/CD Pipelines](#authenticating-services-within-cicd-pipelines)

### API Key Management

The first scenario involves API Key Management, it behaves differently than Service-to-Service Tokens. When SaaS applications have their own set of APIs that need to communicate with their customer machines without using the user's identity.

A set of API keys are generated from the SaaS application which can then be sent from the customer's API request via a HTTP header.

[![API Key Management](https://i.ibb.co/M2C7wrF/Clean-Shot-2024-04-07-at-10-37-19.png)](https://ibb.co/RvDcrfR)

### Service-To-Service Tokens

Service-to-service tokens are often used in more distributed systems, where microservices need to communicate with each other. It's about both authentication and authorization.

In this case, we don't have a user identity that initiates the process by generating a set of API keys on an application side.

The generated tokens are often JWTs, containing claims that can specify the identity of the service, the scope of access and the token's expiration time. For more details regarding the JWT structure, refer to [Credentials](../credentials/index.md)

Services like [HashiCorp vault](https://www.vaultproject.io/) are often used to manage tokens for each service in a cluster.

[![S2S Tokens](https://i.ibb.co/s9MQCpD/Clean-Shot-2024-04-07-at-11-14-26.png)](https://ibb.co/gZBwdbX)

### Authenticating services within CI/CD Pipelines

This use case involves creating a service designed for integration within CI/CD workflows. There are two options here:
- [Recommended] OpenID Connect can be used to replace CI/CD credentials
- [Alternative] CI/CD credentials with static API keys generated from each service

#### OpenID Connect

OpenID Connect can be used to replace CI/CD credentials. As a reference, [AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) allows GitHub actions to access resources without needing to store credentials as secrets, through the usage of [OpenID Connect](../use-cases/index.md).

The client is a cloud provider such as AWS. The end user is a job running in a CI/CD pipeline. The benefits are:
- Infrastructure as Code (IaC) compatibility
- Short-lived credentials
- No need for manual credential management

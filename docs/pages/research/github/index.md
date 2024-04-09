---
title: "DX Research - GitHub"
---

# GitHub

GitHub provides two different types of authentication:
- GitHub apps
- OAuth apps

OAuth apps can only act on behalf of a user while GitHub Apps can either act on behalf of a user or independently of a user - [reference to documentation](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app).

> GitHub Apps use short lived tokens. If the token is leaked, the token will be valid for a shorter amount of time, which reduces the damage that can be done. Conversely, OAuth app tokens do not expire until the person who authorized the OAuth app revokes the token.

This [article](https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/) from the Github blog in 2021, discusses API key usability. Some considerations are:
- Include checksums in keys to ensure their integrity upon copying.
- Ensure keys are free from characters like hyphens to facilitate copying with a double-click.

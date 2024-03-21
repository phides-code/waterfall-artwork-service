# ts-dynamodb-service-template

A TypeScript project template providing CRUD services for a DynamoDB table, using AWS Lambda and API Gateway, deployed with AWS SAM and GitHub Actions.

### Customize

-   Find and replace `Waterfall` with the name of the app (upper and lowercase A)
-   Find and replace `Artwork`/`Artworks` with the table name (upper and lowercase A)
-   Find and replace `ca-central-1` with the AWS region
-   Update interface in `types.ts` to suit your table structure
-   Update values in `constants.ts`
-   Update fields in `helpers.ts`

### Deploy manually

-   `make deploy`

### Run locally

-   `make build && sam local start-api --port 8000`

### Setup GitHub actions

Once the repo is setup on GitHub, add AWS secrets to GitHub Actions for this repo:

-   `gh secret set AWS_ACCESS_KEY_ID`
-   `gh secret set AWS_SECRET_ACCESS_KEY`

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "/BCtoMondayInteg/MondaySecrets";

const client = new SecretsManagerClient({
  region: "us-east-2",
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret = JSON.parse(response.SecretString);
console.log(secret);
const BCACCESSTOKEN = "4g7sbf194xs6trfdv3ze8jsg07cvdsq";
const BCCLIENTID = "lh5nnucorfnhjofaxx3oom6zj5rcmqs";
const BCSTOREHASH = secret.BCSTOREHASH;
const MYPORT = process.env.MYPORT;
const stage = "prod";
const MONDAYBOARDID = secret.MONDAYBOARDID;
const MONDAYTOKEN = secret.MONDAYTOKEN;
const MONDAYSECRETSARN =
  "arn:aws:secretsmanager:us-east-2:104616629458:secret:/BCtoMondayInteg/MondaySecrets-qO4zY2";

export {
  BCACCESSTOKEN,
  BCCLIENTID,
  BCSTOREHASH,
  MYPORT,
  MONDAYBOARDID,
  MONDAYTOKEN,
  stage,
  MONDAYSECRETSARN,
};

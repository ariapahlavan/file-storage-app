export interface JwksKey {
  kid: string;
  x5c: string[];
}

export interface JwksResponseData {
  keys: JwksKey[]
}


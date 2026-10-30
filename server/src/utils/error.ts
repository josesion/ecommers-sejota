export class ClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "ClientError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, ClientError.prototype);
  }
}

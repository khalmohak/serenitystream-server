export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number=500, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
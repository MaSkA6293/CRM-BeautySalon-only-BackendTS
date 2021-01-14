export interface IGetUserAuthInfoRequest extends Request {
    user: { _id: string } // or any other type
}
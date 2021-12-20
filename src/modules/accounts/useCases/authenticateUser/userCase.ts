import { inject, injectable } from "tsyringe";
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken";
import dotenv from "dotenv"
import { IRequest, IResponse } from "../../interfaces/IAuthenticate"
import { IUserRepository } from "../../interfaces/IUser"
import { UsersRepositorys } from "../../repositories/Users"
import { AppError } from "../../../../errors/error";

dotenv.config()


@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject(UsersRepositorys)
    private usersRepository: IUserRepository 
  ) {

  } 

  async execute({ email, password }: IRequest ): Promise<IResponse> {
    
    const user = await this.usersRepository.findByEmail(email)
    if(!user){
      throw new AppError('Email or password invalid', 401)
    }

    const passwordMatched = await compare(password, user.password)
    if (!passwordMatched) {
      throw new AppError('Email or password invalid', 401)
    }

    const token = sign({}, process.env.JWT as string, {
      subject: user.id,
      expiresIn: "1d"
    })

    return {
      user: {
        name: user.name,
        email: user.email
      },
      token
    }

  }
}

export { AuthenticateUserUseCase }
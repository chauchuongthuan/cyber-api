import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
   @IsNotEmpty({ message: 'Email is required!' })
   @ApiProperty()
   email: string;

   @IsNotEmpty({ message: 'Password is required!' })
   @ApiProperty()
   password: string;
}

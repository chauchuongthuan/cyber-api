// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
   @ApiProperty({
      type: String,
      description: 'Email',
      required: true,
   })
   @IsNotEmpty({ message: 'Email is required!' })
   email: string;

   @ApiProperty({
      type: String,
      description: 'Password',
      required: true,
   })
   @IsNotEmpty({ message: 'Password is required!' })
   password: string;
}

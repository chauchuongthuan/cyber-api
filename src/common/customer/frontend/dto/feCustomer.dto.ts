import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class FeCustomerDto {
   @IsNotEmpty({ message: 'Username is required!' })
   @ApiProperty()
   username: string;

   @IsNotEmpty({ message: 'Email is required!' })
   @ApiProperty()
   email: string;

   @IsNotEmpty({ message: 'Password is required!' })
   @ApiProperty()
   password: string;

   @IsOptional()
   @ApiProperty()
   telegramUserId: string;
}

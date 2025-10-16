// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BeCustomerDto {
   @IsNotEmpty({ message: 'Username is required!' })
   @ApiProperty({
      description: 'username',
      required: true,
   })
   username: string;

   @IsNotEmpty({ message: 'Email is required!' })
   @ApiProperty({
      description: 'email',
      required: true,
   })
   email: string;

   @IsOptional()
   @ApiProperty({
      description: 'balance',
      required: false,
   })
   balance: number;

   @IsOptional()
   @ApiProperty({
      description: 'password',
      required: false,
   })
   password: string;
}

export class ChangeStatusDto {
   @ApiProperty({
      description: 'id',
   })
   @IsNotEmpty({ message: 'id is required!' })
   id: string;

   @ApiProperty({
      description: 'active',
   })
   @IsNotEmpty({ message: 'active is required!' })
   active: boolean;
}

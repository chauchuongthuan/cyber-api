// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BeOrderDto {
   @IsNotEmpty({ message: 'Type is required!' })
   @ApiProperty()
   product: string;

   @ApiProperty()
   @IsNotEmpty({ message: 'Quantity is required!' })
   quantity: number;

   @ApiProperty()
   @IsOptional()
   customer: string;
}

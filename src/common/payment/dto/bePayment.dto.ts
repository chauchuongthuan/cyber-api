// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BePaymentDto {
   @IsNotEmpty({ message: 'Type is required!' })
   @ApiProperty()
   type: number;

   @ApiProperty()
   @IsOptional()
   coin: number;

   @ApiProperty()
   @IsNotEmpty({ message: 'USD is required!' })
   usd: number;

   @ApiProperty()
   @IsOptional()
   status: number;
}

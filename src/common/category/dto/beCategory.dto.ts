// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BeCategoryDto {
   @IsNotEmpty({ message: 'Name is required!' })
   @ApiProperty()
   name: string;

   @IsOptional()
   @ApiProperty()
   slug: string;

   @ApiProperty()
   @IsOptional()
   sortOrder: number;

   @ApiProperty()
   @IsNotEmpty({ message: 'unCategory is required!' })
   unCategory: boolean;
}

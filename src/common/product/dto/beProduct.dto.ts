// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BeProductDto {
   @ApiProperty({
      description: 'image',
      nullable: true,
   })
   @IsOptional()
   image: string;

   @ApiProperty({
      description: 'country',
      nullable: true,
   })
   @IsOptional()
   country: string;

   @IsNotEmpty({ message: 'Name is required!' })
   @ApiProperty()
   name: string;

   @IsOptional()
   @ApiProperty()
   title: string;

   @IsOptional()
   @ApiProperty()
   subname: string;

   @IsOptional()
   @ApiProperty()
   info: string;

   @IsOptional()
   @ApiProperty()
   description: string;

   @IsOptional()
   @ApiProperty()
   page: any;

   @IsNotEmpty({ message: 'Slug is required!' })
   @ApiProperty()
   slug: string;

   @ApiProperty()
   @IsOptional()
   sortOrder: number;

   @ApiProperty()
   @IsOptional()
   quantity: number;

   @IsNotEmpty({ message: 'Category is required!' })
   @ApiProperty()
   category: string;

   @IsNotEmpty({ message: 'rating is required!' })
   @ApiProperty()
   rating: string;

   @IsOptional()
   @ApiProperty()
   verified: boolean;

   @IsNotEmpty({ message: 'countryName is required!' })
   @ApiProperty()
   countryName: string;

   @IsOptional()
   @ApiProperty()
   content: Array<string>;

   @IsNotEmpty({ message: 'Price is required!' })
   @ApiProperty()
   price: string;
}


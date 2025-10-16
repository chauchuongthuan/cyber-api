import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { IsExistFileTmp } from '@core/validator/IsExistFileTmp';
import { IsValidTrans } from '@core/validator/IsValidTrans';
import { MyDate } from '@core/validator/myDate';
import { StatusEnum } from '@core/constants/post.enum';
import { IsValidFileTrans } from '@src/core/validator/IsValidFileTrans';
export class BePostDto {

   @ApiProperty({
      type: String,
      description: 'title',
      required: true,
   })
   @IsNotEmpty()
   title: string;

   @ApiProperty({
      type: String,
      description: 'content',
      required: true,
   })
   @IsNotEmpty()
   content: string;

   @ApiProperty({
      type: String,
      description: 'author',
      required: true,
   })
   @IsOptional()
   author: string;

   @ApiProperty({
      type: String,
      description: 'readTime',
      required: true,
   })
   @IsOptional()
   readTime: string;

   @ApiProperty({
      description: 'image',
      nullable: true,
   })
   @IsOptional()
   image: string;
}

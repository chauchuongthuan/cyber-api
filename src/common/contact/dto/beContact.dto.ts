// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsExistFileTmp } from '@core/validator/IsExistFileTmp';
import { Prop } from '@nestjs/mongoose';

export class BeContactDto {
   @IsNotEmpty({ message: 'Tên là bắt buộc!' })
   @ApiProperty({
      description: 'name',
   })
   name: string;

   @IsNotEmpty({ message: 'Email là bắt buộc!' })
   @ApiProperty({
      description: 'email',
   })
   email: string;

   @IsNotEmpty({ message: 'taskType là bắt buộc!' })
   @ApiProperty({
      description: 'taskType',
   })
   taskType: string;

   @IsOptional()
   @ApiProperty({
      description: 'priority',
   })
   priority: string;

   @IsNotEmpty({ message: 'subject là bắt buộc!' })
   @ApiProperty({
      description: 'subject',
   })
   subject: string;

   @IsNotEmpty({ message: 'message là bắt buộc!' })
   @ApiProperty({
      description: 'message',
   })
   message: string;

}

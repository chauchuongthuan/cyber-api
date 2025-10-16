import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length, IsNotEmpty, IsEmail } from 'class-validator';
import { IsExistFileTmp } from '@core/validator/IsExistFileTmp';

export class ProfileDto {
   @ApiProperty({
      type: 'File',
      description: 'profileImage',
      maxLength: 255,
      nullable: true,
   })
   @IsOptional()
   @IsExistFileTmp([], {
      message: 'Profile image is invalid!',
   })
   profileImage: string;

   @ApiProperty({
      type: String,
      description: 'name',
      minLength: 5,
      maxLength: 255,
      required: true,
   })
   @IsNotEmpty({ message: 'Name is required!' })
   @Length(5, 255, { message: 'Name has length from 5 to 255!' })
   name: string;

   @ApiProperty({
      type: String,
      description: 'email',
      uniqueItems: true,
      required: true,
   })
   @IsEmail({}, { message: 'Email is invalid!' })
   email: string;

   @ApiProperty({
      type: String,
      description: 'currentPassword',
      nullable: true,
   })
   @IsNotEmpty({ message: 'Current password is required!' })
   @Length(6, 255)
   currentPassword: string;

   @ApiProperty({
      type: String,
      description: 'newPassword',
      minLength: 6,
      maxLength: 255,
      nullable: true,
   })
   @IsOptional()
   @Length(6, 255)
   password: string;
}

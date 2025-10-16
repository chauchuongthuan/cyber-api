import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Request,
    UseInterceptors,
    UploadedFiles,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TransformerCustomerService } from '@common/customer/services/transformerCustomer.service';
import { ResponseService } from '@core/services/response.service';
import { UserSecure } from '@common/auth/user/decorators/userSecure.decorator';
import { HasFile } from '@core/decorators/hasFile.decorator';
import { ApiBody, ApiTags, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ActivityInterceptor } from '@core/interceptors/activity.interceptor';
import { CoreTransformInterceptor } from '@core/interceptors/coreTransform.interceptor';
import { DefaultListQuery } from '@core/decorators/defaultListQuery.decorator';
import { SubscriberService } from '../services/subscriber.service';
import { TransformerSubscriberService } from '../services/transformerSubscriber.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BeSubscriberDto, ChangeStatusDto } from '../dto/beSubcriber.dto';
import { CustomerSecure } from '@src/common/auth/customer/decorators/customerSecure.decorator';
import { CustomerAuth } from '@src/common/auth/customer/decorators/customer.decorator';
import { Customer } from '@src/schemas/customer/customer.schemas';

@ApiTags('Subscribers')
@Controller('subscribers')
@UseInterceptors(CoreTransformInterceptor)
export class SubscriberController {
    constructor(
        private subscriberService: SubscriberService,
        private transformer: TransformerSubscriberService,
        private response: ResponseService,
    ) { }

    @Get()
    @CustomerSecure()
    @DefaultListQuery()
    async findAll(@Query() query: Record<string, any>, @CustomerAuth() customer: Customer): Promise<any> {
        const items = await this.subscriberService.findAll({
            ...query,
            customer: customer.id,
            isFe: true
        });
        return this.response.fetchListSuccess(await this.transformer.transformSubscriberList(items));
    }

    @Post()
    @CustomerSecure()
    @ApiBody({ type: BeSubscriberDto })
    async create(@Body() dto: BeSubscriberDto, @CustomerAuth() customer: Customer): Promise<any> {
        const item = await this.subscriberService.create({
            ...dto,
            customer: customer.id
        });
        if (!item) return this.response.createdFail();
        return this.response.createdSuccess(await this.transformer.transformSubscriberDetail(item));
    }

    @Delete()
    @CustomerSecure()
    async deletes(@Body('ids') ids: Array<string>): Promise<any> {
        const item = await this.subscriberService.deletes(ids);
        if (!item) return this.response.deletedFail();
        return this.response.deletedSuccess();
    }
}

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
import { ContactService } from '../services/contact.service';
import { TransformerContactService } from '../services/transformerContact.service';
import { ACL } from '@src/common/auth/decorators/acl.decorator';
import { Permissions } from '@src/core/services/permission.service';
import { BeContactDto } from '../dto/beContact.dto';

@ApiTags('Contacts')
@Controller('contacts')
@UserSecure()
@UseInterceptors(CoreTransformInterceptor)
export class FeContactController {
    constructor(
        private contactService: ContactService,
        private transformer: TransformerContactService,
        private response: ResponseService,
    ) { }

    // Find list contacts
    @Get()
    @DefaultListQuery()
    @ACL(Permissions.contact_list)
    async findAll(@Query() query: Record<string, any>): Promise<any> {
        const items = await this.contactService.findAll({ ...query, isFe: true });
        if (query.get && query.export) return this.transformer.transformContactExport(items);
        return this.response.fetchListSuccess(this.transformer.transformContactList(items));
    }

}

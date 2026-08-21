import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FormTemplate } from './form-template.entity'
import { FormTemplateVersion } from './form-template-version.entity'
import { FormSubmission } from './form-submission.entity'
import { FormsService } from './forms.service'
import { FormsController } from './forms.controller'

@Module({
  imports: [TypeOrmModule.forFeature([FormTemplate, FormTemplateVersion, FormSubmission])],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}

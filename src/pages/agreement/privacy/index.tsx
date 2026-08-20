import React from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const PrivacyPolicy: React.FC = () => {
  Taro.usePageEvent('onShareAppMessage', () => ({}))

  return (
    <ScrollView className='agreement-page' scrollY>
      <View className='agreement-content'>
        <View className='agreement-date'>更新日期：2026年7月</View>
        <View className='agreement-date'>生效日期：2026年7月</View>

        <View className='agreement-section'>
          <View className='agreement-title'>引言</View>
          <View className='agreement-text'>
            宠爱有期（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规的规定，保护您的个人信息及隐私安全。本隐私政策将帮助您了解以下内容：
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>一、我们收集的信息</View>
          <View className='agreement-text'>
            在您使用本小程序服务的过程中，我们会按照如下方式收集您在使用服务时主动提供的或因为使用服务而产生的信息：
          </View>
          <View className='agreement-text'>
            1.1 账号信息：当您注册账号时，我们需要收集您的电子邮箱地址和密码，用于创建和登录您的个人账户。
          </View>
          <View className='agreement-text'>
            1.2 宠物信息：当您添加宠物信息时，我们会收集您主动提供的宠物名称、类型、品种、性别、出生日期、体重等信息，这些信息用于帮您管理宠物的健康记录。
          </View>
          <View className='agreement-text'>
            1.3 健康数据：当您记录宠物的疫苗、用药、健康计划、健康记录等信息时，我们会收集相关的日期和内容数据，用于为您提供宠物的健康管理和到期提醒服务。
          </View>
          <View className='agreement-text'>
            1.4 产品库存信息：当您添加产品时，我们会收集产品名称、分类、批次号、生产日期、保质期等信息，用于帮您管理宠物用品的效期。
          </View>
          <View className='agreement-text'>
            1.5 反馈信息：当您使用意见反馈功能时，我们会收集您提交的反馈内容和您选填的联系方式。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>二、信息的使用</View>
          <View className='agreement-text'>
            2.1 我们使用收集的信息主要用于以下目的：
          </View>
          <View className='agreement-text'>
            （1）为您提供宠物健康管理、产品效期管理的核心功能服务；
          </View>
          <View className='agreement-text'>
            （2）计算商品剩余天数并生成到期提醒通知；
          </View>
          <View className='agreement-text'>
            （3）保障服务的安全性和稳定性；
          </View>
          <View className='agreement-text'>
            （4）响应您的反馈和客服需求。
          </View>
          <View className='agreement-text'>
            2.2 我们不会主动向第三方提供、共享或转移您的个人信息，法律法规规定或您主动授权的情况除外。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>三、信息的存储与安全</View>
          <View className='agreement-text'>
            3.1 您的个人信息存储于我们的服务器中，我们采取了合理的技术措施和管理措施保护您的信息安全。
          </View>
          <View className='agreement-text'>
            3.2 我们仅在为您提供服务所必需的期限内保留您的个人信息，超出必要期限后将进行删除或匿名化处理。
          </View>
          <View className='agreement-text'>
            3.3 您的账号密码采用加密方式存储，我们无法查看您的明文密码。
          </View>
          <View className='agreement-text'>
            3.4 我们建议您妥善保管账号密码，不要与他人共享账号。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>四、Cookie 和本地存储</View>
          <View className='agreement-text'>
            为保障服务正常运行，我们可能会在您的设备上存储小型数据文件（Cookie 或类似技术）。我们使用此类技术主要用于保存您的登录状态和偏好设置，不会用于本政策所述目的之外的任何用途。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>五、您的权利</View>
          <View className='agreement-text'>
            5.1 您有权访问、更正、删除您的个人信息。您可以在应用内通过"我的"页面修改个人资料，或删除宠物、产品等数据。
          </View>
          <View className='agreement-text'>
            5.2 您有权注销您的账户。如需注销，请通过意见反馈功能联系我们。
          </View>
          <View className='agreement-text'>
            5.3 您有权撤回已同意的授权，撤回后我们将不再处理相应的个人信息。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>六、未成年人保护</View>
          <View className='agreement-text'>
            本小程序主要面向成人用户。如果您是未满18周岁的未成年人，请在监护人陪同下使用本服务，并由监护人协助阅读本隐私政策。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>七、隐私政策的更新</View>
          <View className='agreement-text'>
            我们可能会适时对本隐私政策进行修订。当隐私政策发生变更时，我们会在小程序内以适当方式通知您。请您定期查阅本隐私政策以了解最新内容。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>八、联系我们</View>
          <View className='agreement-text'>
            如您对本隐私政策或个人信息保护相关事宜有任何疑问，请通过小程序内的"意见反馈"功能与我们联系。我们将在合理时间内回复您的请求。
          </View>
        </View>

        <View className='agreement-footer'>
          宠爱有期团队
        </View>
      </View>
    </ScrollView>
  )
}

export default PrivacyPolicy

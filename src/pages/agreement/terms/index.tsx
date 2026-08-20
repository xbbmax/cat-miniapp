import React from 'react'
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const UserAgreement: React.FC = () => {
  Taro.usePageEvent('onShareAppMessage', () => ({}))

  return (
    <ScrollView className='agreement-page' scrollY>
      <View className='agreement-content'>
        <View className='agreement-date'>更新日期：2026年7月</View>
        <View className='agreement-date'>生效日期：2026年7月</View>

        <View className='agreement-section'>
          <View className='agreement-title'>一、特别提示</View>
          <View className='agreement-text'>
            1.1 宠爱有期（以下简称"本小程序"）的各项服务由宠爱有期团队提供。在您使用本小程序服务之前，请您务必审慎阅读、充分理解本协议各条款内容。
          </View>
          <View className='agreement-text'>
            1.2 当您按照注册页面提示完成注册程序后，即表示您已充分阅读、理解并接受本协议的全部内容，并与宠爱有期达成协议。您承诺接受并遵守本协议的约定，届时您不应以未阅读本协议的内容为由，主张本协议无效或要求撤销本协议。
          </View>
          <View className='agreement-text'>
            1.3 如果您未满18周岁，请在法定监护人的陪同下阅读本协议。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>二、账号注册与管理</View>
          <View className='agreement-text'>
            2.1 您在使用本小程序服务前需要注册一个账号。注册时您需要提供电子邮箱地址并设置密码。您应当提供真实、准确的注册信息，并在信息变更时及时更新。
          </View>
          <View className='agreement-text'>
            2.2 您注册的账号仅限于您本人使用，禁止赠与、借用、租用、转让或售卖账号。因您保管不善导致账号被他人使用的，由您自行承担相应责任。
          </View>
          <View className='agreement-text'>
            2.3 您应当妥善保管账号密码，对以您的账号进行的所有活动和事件负法律责任。如您发现账号存在安全漏洞或异常登录，应立即通知我们。
          </View>
          <View className='agreement-text'>
            2.4 您有权注销账号，注销后我们将在合理期限内删除您的个人信息（法律法规另有规定的除外）。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>三、服务内容</View>
          <View className='agreement-text'>
            3.1 本小程序为您提供以下服务：宠物信息管理、宠物健康记录管理（疫苗、用药、健康计划、健康记录）、宠物用品库存及效期管理、到期提醒通知。
          </View>
          <View className='agreement-text'>
            3.2 本小程序展示的商品效期剩余天数仅作为参考提醒，不作为商品实际可使用期限的法律依据。实际操作中请以商品包装上的标注为准。
          </View>
          <View className='agreement-text'>
            3.3 我们可能根据服务需要进行功能升级或调整，并以适当方式通知您。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>四、用户行为规范</View>
          <View className='agreement-text'>
            4.1 您在使用本小程序服务时，应遵守中华人民共和国相关法律法规，不得利用本小程序从事违法违规活动，包括但不限于：
          </View>
          <View className='agreement-text'>
            （1）发布、传播危害国家安全、破坏民族团结、破坏国家宗教政策、扰乱社会秩序、侮辱诽谤、淫秽色情等内容；
          </View>
          <View className='agreement-text'>
            （2）侵害他人知识产权、商业秘密、名誉权、隐私权等合法权益；
          </View>
          <View className='agreement-text'>
            （3）利用技术手段恶意攻击、干扰本小程序正常运营；
          </View>
          <View className='agreement-text'>
            4.2 如您违反上述规定，我们有权采取删除违规内容、暂停或终止服务、封禁账号等措施，并保留追究法律责任的权利。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>五、知识产权</View>
          <View className='agreement-text'>
            5.1 本小程序的所有内容，包括但不限于文字、图标、界面设计、程序代码等，其知识产权归宠爱有期或相关权利人所有。
          </View>
          <View className='agreement-text'>
            5.2 未经我们或相关权利人书面许可，您不得以任何方式复制、修改、传播、出售本小程序的内容或用于商业目的。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>六、免责声明</View>
          <View className='agreement-text'>
            6.1 我们按照"现状"和"可得到"的状态提供服务，不对服务的及时性、安全性、准确性作任何明示或默示的保证。
          </View>
          <View className='agreement-text'>
            6.2 因不可抗力、计算机病毒、网络故障、系统维护等原因导致的服务中断，我们不承担赔偿责任，但将尽力减少因此给您带来的影响。
          </View>
          <View className='agreement-text'>
            6.3 本小程序提供的健康管理建议仅供参考，不构成医疗建议。涉及宠物健康的专业问题，请咨询执业兽医师。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>七、协议修改</View>
          <View className='agreement-text'>
            7.1 我们有权根据需要修改本协议条款，修改后的协议将在小程序内公布。如您继续使用本小程序服务，则视为您接受修改后的协议。
          </View>
          <View className='agreement-text'>
            7.2 如您不同意修改后的协议，您应停止使用本小程序服务。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>八、法律适用与争议解决</View>
          <View className='agreement-text'>
            8.1 本协议的订立、执行和解释及争议的解决均适用中华人民共和国法律。
          </View>
          <View className='agreement-text'>
            8.2 因本协议引起的或与之相关的任何争议，双方应友好协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
          </View>
        </View>

        <View className='agreement-section'>
          <View className='agreement-title'>九、联系我们</View>
          <View className='agreement-text'>
            如您对本协议有任何疑问或需要帮助，请通过小程序内的"意见反馈"功能与我们联系。
          </View>
        </View>

        <View className='agreement-footer'>
          宠爱有期团队
        </View>
      </View>
    </ScrollView>
  )
}

export default UserAgreement

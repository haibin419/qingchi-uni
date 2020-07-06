import { appModule, chatModule, platformModule, userModule } from './index'
import UserVO from '@/model/user/UserVO'
import UserAPI from '@/api/UserAPI'
import ResultVO from '@/model/ResultVO'
import WebsocketUtil from '@/utils/WebsocketUtil'
import TokenUtil from '@/utils/TokenUtil'
import UniUtils from '@/utils/UniUtils'
import AppInitDataVO from '@/model/common/AppInitDataVO'

export default class UserStore {
  static hasUser (): boolean {
    return !!userModule.user
  }

  static setMineUser (user: UserVO) {
    userModule.user = user
  }

  static async getMineUserAction () {
    return UserAPI.getMineUserInfoAPI().then((res: any) => {
      UserStore.setMineUser(res.data)
      return res
    })
  }

  static initUserStore (res: ResultVO<AppInitDataVO>) {
    // 如果存在用户
    if (res.data.user) {
      appModule.notifies = res.data.notifies
      UserStore.setMineUser(res.data.user)
      // 所有操作都是登陆后才可以操作的
      platformModule.qq_talkTemplateId = res.data.qq_talkTemplateId
      platformModule.qq_commentTemplateId = res.data.qq_commentTemplateId
      platformModule.qq_reportResultTemplateId = res.data.qq_reportResultTemplateId
      platformModule.qq_violationTemplateId = res.data.qq_violationTemplateId

      platformModule.wx_talkTemplateId = res.data.wx_talkTemplateId
      platformModule.wx_commentTemplateId = res.data.wx_commentTemplateId
      platformModule.wx_reportResultTemplateId = res.data.wx_reportResultTemplateId
      platformModule.wx_violationTemplateId = res.data.wx_violationTemplateId
    }
    chatModule.setChatsAction(res.data.chats)
  }

  static loginAfter (res: ResultVO<any>) {
    // 设置token
    TokenUtil.set(res.data.tokenCode)
    WebsocketUtil.websocketClose()
    UserStore.initUserStore(res)
  }

  static loginOut () {
    TokenUtil.remove()
    WebsocketUtil.websocketClose()
    UserStore.setMineUser(null)
    chatModule.getChatsAction()
    //没必要重设地理位置吧
    // DistrictUtil.重设地理位(DistrictUtil.initDistrict)
    UniUtils.toast('用户退出')
  }
}
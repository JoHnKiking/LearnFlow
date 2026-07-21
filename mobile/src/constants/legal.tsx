import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// 基础样式（不含颜色，颜色由组件内部根据主题动态注入）
const _sectionH = { fontSize: 16, fontWeight: '700' as const, marginBottom: 8, marginTop: 20 };
const _subSectionH = { fontSize: 14, fontWeight: '700' as const, marginBottom: 6, marginTop: 12 };
const _sectionB = { fontSize: 14, lineHeight: 22 as const, marginBottom: 12 };
const _bullet = { fontSize: 14, lineHeight: 22 as const, marginBottom: 6, paddingLeft: 8 };
const _note = { fontSize: 12, lineHeight: 20 as const, marginBottom: 12, fontStyle: 'italic' as const };

// ============ 隐私政策（正式合规版） ============
export const PRIVACY_POLICY_CONTENT = () => {
  const { colors } = useTheme();
  const sectionH = { ..._sectionH, color: colors.textPrimary };
  const subSectionH = { ..._subSectionH, color: colors.textPrimary };
  const sectionB = { ..._sectionB, color: colors.textPrimary };
  const bullet = { ..._bullet, color: colors.textSecondary };
  const note = { ..._note, color: colors.textSecondary };
  const title = { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: colors.textPrimary };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      <Text style={title}>
        LearnFlow 隐私政策
      </Text>
      <Text style={{ ...note, textAlign: 'center' }}>
        生效日期：2026年07月21日{'\n'}更新日期：2026年07月21日
      </Text>

      <Text style={sectionB}>
        欢迎您使用 LearnFlow - 沉浸式技能学习伴侣（以下简称"LearnFlow"或"本应用"）。
      </Text>
      <Text style={sectionB}>
        LearnFlow 由 Learnflow学了么（以下简称"我们"）开发并运营。我们非常重视您的个人信息和隐私保护，并将按照适用法律法规要求，采取相应安全保护措施，尽力保护您的个人信息安全。
      </Text>
      <Text style={sectionB}>
        在您使用本应用前，请您认真阅读并充分理解本《隐私政策》。您勾选同意本政策并使用本应用，即表示您已阅读、理解并同意本政策全部内容。如您不同意本政策的任何内容，请停止使用本应用。
      </Text>

      <Text style={sectionH}>一、我们如何收集和使用您的个人信息</Text>
      <Text style={sectionB}>
        我们遵循合法、正当、必要、诚信、公开透明、最小必要原则处理您的个人信息。
      </Text>

      <Text style={subSectionH}>1. 账号注册、登录与身份验证</Text>
      <Text style={bullet}>• 邮箱地址：用于账号注册、登录、身份验证、账号找回及服务通知；</Text>
      <Text style={bullet}>• 登录密码：用于身份验证。您的密码将经过加密处理后存储，我们不会以明文形式保存您的密码；</Text>
      <Text style={bullet}>• 账号基础信息：包括用户名、账号状态、注册时间、最近登录时间、登录次数等；</Text>
      <Text style={bullet}>• 设备会话信息：包括设备标识信息、设备类型、设备名称、登录会话、令牌有效期等，用于保持登录状态、设备会话管理和账号安全保障。</Text>
      <Text style={sectionB}>
        如您拒绝提供前述必要信息，您将无法完成注册、登录或使用账号基础功能。
      </Text>

      <Text style={subSectionH}>2. 新手引导与初始化设置</Text>
      <Text style={bullet}>• 新手引导完成状态；</Text>
      <Text style={bullet}>• 您选择的怪物伙伴类型、名称、性格类型；</Text>
      <Text style={bullet}>• 您选择的学习模块、学习方向或初始偏好。</Text>

      <Text style={subSectionH}>3. 技能树学习功能</Text>
      <Text style={bullet}>• 您输入的学习领域名称、关键词或学习目标；</Text>
      <Text style={bullet}>• AI 生成的技能树内容，包括标题、描述、节点结构、阶段划分等；</Text>
      <Text style={bullet}>• 学习进度信息，包括节点完成状态、学习时长、更新时间等；</Text>
      <Text style={bullet}>• 学习统计信息，包括学习报告、进度概览、完成情况等。</Text>

      <Text style={subSectionH}>4. AI 生成与 AI 对话功能</Text>
      <Text style={bullet}>• 您输入的学习主题、问题内容、上下文内容；</Text>
      <Text style={bullet}>• AI 生成的回复内容、技能树内容；</Text>
      <Text style={bullet}>• AI 对话记录、时间信息、使用记录；</Text>
      <Text style={bullet}>• 与 AI 功能运行相关的必要技术日志。</Text>
      <Text style={{ ...sectionB, fontWeight: '600' as const }}>特别提示：</Text>
      <Text style={bullet}>• 当前 LearnFlow 的 AI 功能由 DeepSeek 提供相关能力支持；</Text>
      <Text style={bullet}>• 请您不要在 AI 输入内容中主动提交与使用目的无关的敏感个人信息；</Text>
      <Text style={bullet}>• 如您主动输入相关信息，由此产生的风险需由您谨慎判断和承担相应注意义务。</Text>

      <Text style={subSectionH}>5. 数字宠物陪伴功能</Text>
      <Text style={bullet}>• 宠物名称、类型、风格、性格；</Text>
      <Text style={bullet}>• 体力值、能量值、等级、经验值；</Text>
      <Text style={bullet}>• 学习消耗、游戏恢复、奖励发放等状态变化数据；</Text>
      <Text style={bullet}>• 宠物互动消息与陪伴记录。</Text>

      <Text style={subSectionH}>6. 迷你游戏功能</Text>
      <Text style={bullet}>• 游戏参与记录；</Text>
      <Text style={bullet}>• 每日可玩次数；</Text>
      <Text style={bullet}>• 通关情况；</Text>
      <Text style={bullet}>• 奖励记录；</Text>
      <Text style={bullet}>• 保障系统平衡和功能运行所需的必要日志。</Text>

      <Text style={subSectionH}>7. 番茄钟、学习笔记与学习工具功能</Text>
      <Text style={bullet}>• 番茄钟：专注时长设置、任务名称/状态、开始/结束时间、专注记录与学习统计。</Text>
      <Text style={bullet}>• 学习笔记：笔记标题、笔记正文内容、创建/更新时间、笔记关联信息。</Text>

      <Text style={subSectionH}>8. 帮助与反馈</Text>
      <Text style={bullet}>• 您提交的问题描述、反馈内容；</Text>
      <Text style={bullet}>• 您主动提供的联系方式；</Text>
      <Text style={bullet}>• 您主动上传的截图、日志、问题复现信息；</Text>
      <Text style={bullet}>• 反馈处理记录。</Text>

      <Text style={sectionH}>二、我们处理个人信息的规则</Text>
      <Text style={bullet}>• 为向您提供产品和服务所必需；</Text>
      <Text style={bullet}>• 为保障账号与服务安全所必需；</Text>
      <Text style={bullet}>• 基于您的授权同意；</Text>
      <Text style={bullet}>• 为履行法定义务所必需；</Text>
      <Text style={bullet}>• 法律法规允许的其他情形。</Text>
      <Text style={sectionB}>
        对于基于同意处理的个人信息，您有权依法撤回同意。撤回同意不影响撤回前基于同意开展处理活动的合法性。
      </Text>

      <Text style={sectionH}>三、我们如何使用本地存储和相关技术</Text>
      <Text style={bullet}>• 保存登录状态和会话信息；</Text>
      <Text style={bullet}>• 记录新手引导状态；</Text>
      <Text style={bullet}>• 保存学习设置和本地偏好；</Text>
      <Text style={bullet}>• 提升页面与功能加载效率；</Text>
      <Text style={bullet}>• 支持安全验证与故障排查。</Text>

      <Text style={sectionH}>四、我们可能收集的设备信息和日志信息</Text>
      <Text style={subSectionH}>1. 设备信息</Text>
      <Text style={sectionB}>
        包括设备型号、操作系统版本、应用版本、网络状态、语言、时区、屏幕参数等。
      </Text>
      <Text style={subSectionH}>2. 日志信息</Text>
      <Text style={sectionB}>
        包括登录日志、访问时间、操作记录、接口请求记录、错误日志、崩溃日志、性能日志等。
      </Text>
      <Text style={subSectionH}>3. 安全风控信息</Text>
      <Text style={sectionB}>
        包括设备会话信息、异常访问记录、令牌校验状态、安全审计日志等。主要用于安全防护、故障排查、性能优化、服务维护和风险控制。
      </Text>

      <Text style={sectionH}>五、我们可能申请的系统权限</Text>
      <Text style={bullet}>• 网络权限：用于注册登录、技能树生成、AI 对话、学习数据同步、内容加载等基础联网功能。</Text>
      <Text style={bullet}>• 通知权限：用于发送番茄钟提醒、学习提醒、系统通知及安全提醒。如您拒绝授权，将无法收到相关通知，但不影响其他功能使用。</Text>
      <Text style={bullet}>• 存储或相册权限：当您需要上传截图、提交反馈、保存内容或导出资料时使用。如您拒绝授权，仅影响对应功能，不影响其他功能使用。</Text>

      <Text style={sectionH}>六、第三方服务、SDK 与外部链接说明</Text>
      <Text style={subSectionH}>1. 第三方技术服务</Text>
      <Text style={bullet}>• AI 模型服务；</Text>
      <Text style={bullet}>• 应用框架与基础开发组件；</Text>
      <Text style={bullet}>• 网络请求与页面加载组件；</Text>
      <Text style={bullet}>• 推送通知、崩溃分析、性能监控等服务（如实际接入）。</Text>

      <Text style={subSectionH}>2. DeepSeek AI 服务说明</Text>
      <Text style={sectionB}>
        LearnFlow 当前 AI 功能使用 DeepSeek 相关能力，用于技能树生成和 AI 对话服务。您在使用 AI 功能时输入的内容及必要上下文信息，可能在实现功能所必需的范围内被传输并处理。
      </Text>
      <Text style={bullet}>• 请勿输入与学习目的无关的敏感个人信息；</Text>
      <Text style={bullet}>• 我们将按照最小必要原则处理相关信息；</Text>
      <Text style={bullet}>• 如未来 AI 服务方式发生重大变化，我们将依法另行告知。</Text>

      <Text style={subSectionH}>3. 第三方学习资源链接</Text>
      <Text style={sectionB}>
        本应用中部分学习节点可能包含指向第三方平台或第三方网页的学习资源链接。第三方平台由其自身独立运营，其隐私政策不适用本隐私政策。我们仅提供学习资源链接展示和跳转入口，不对第三方平台的具体运营、服务内容或数据处理行为承担控制责任。
      </Text>

      <Text style={sectionH}>七、我们如何共享、转让、公开披露您的个人信息</Text>
      <Text style={subSectionH}>1. 共享</Text>
      <Text style={bullet}>• 已取得您的授权或单独同意；</Text>
      <Text style={bullet}>• 为实现特定功能而必须向技术服务提供方提供必要信息；</Text>
      <Text style={bullet}>• 为履行法定义务或响应司法、行政机关要求；</Text>
      <Text style={bullet}>• 法律法规规定的其他情形。</Text>
      <Text style={subSectionH}>2. 转让</Text>
      <Text style={sectionB}>
        原则上，我们不会将您的个人信息转让给任何公司、组织或个人。如因合并、分立、重组、资产转让等原因确需转让个人信息，我们将依法向您告知，并要求新的接收方继续履行个人信息保护义务。
      </Text>
      <Text style={subSectionH}>3. 公开披露</Text>
      <Text style={sectionB}>
        我们不会公开披露您的个人信息，除非已取得您的单独同意，或法律法规、司法机关或行政主管部门另有要求。
      </Text>

      <Text style={sectionH}>八、我们如何存储您的个人信息</Text>
      <Text style={subSectionH}>1. 存储地点</Text>
      <Text style={sectionB}>
        我们在中华人民共和国境内收集和产生的个人信息，将存储在中华人民共和国境内。
      </Text>
      <Text style={subSectionH}>2. 存储期限</Text>
      <Text style={bullet}>• 账号信息：在账号存续期间保存；</Text>
      <Text style={bullet}>• 学习记录、技能树、笔记、宠物数据、奖励记录：在您删除相关内容或注销账号前保存；</Text>
      <Text style={bullet}>• 日志与安全记录：在满足安全审计、风险控制、故障排查及合规要求的合理期限内保存；</Text>
      <Text style={bullet}>• 反馈记录：在问题处理及争议解决所需合理期限内保存。</Text>
      <Text style={sectionB}>
        超过保存期限后，我们将依法删除或匿名化处理相关信息。
      </Text>

      <Text style={sectionH}>九、我们如何保护您的个人信息</Text>
      <Text style={bullet}>• 数据传输加密；</Text>
      <Text style={bullet}>• 密码加密存储；</Text>
      <Text style={bullet}>• 访问权限控制；</Text>
      <Text style={bullet}>• 安全日志审计；</Text>
      <Text style={bullet}>• 漏洞修复和安全测试；</Text>
      <Text style={bullet}>• 最小必要和最小权限控制；</Text>
      <Text style={bullet}>• 内部权限隔离与保密管理；</Text>
      <Text style={bullet}>• 安全事件应急响应机制。</Text>

      <Text style={sectionH}>十、您的个人信息权利</Text>
      <Text style={bullet}>• 查阅、复制您的个人信息；</Text>
      <Text style={bullet}>• 更正、补充您的个人信息；</Text>
      <Text style={bullet}>• 删除您的个人信息；</Text>
      <Text style={bullet}>• 撤回同意；</Text>
      <Text style={bullet}>• 注销账号；</Text>
      <Text style={bullet}>• 获取本政策解释说明；</Text>
      <Text style={bullet}>• 向有关主管部门投诉举报，或依法提起诉讼。</Text>

      <Text style={sectionH}>十一、未成年人保护</Text>
      <Text style={sectionB}>
        LearnFlow 主要面向具有相应民事行为能力的用户提供服务。如您为未满十四周岁的未成年人，应在监护人同意并指导下使用本应用。监护人应帮助未成年人正确理解本政策，并对未成年人的使用行为进行指导和监督。
      </Text>

      <Text style={sectionH}>十二、本隐私政策的更新</Text>
      <Text style={sectionB}>
        我们可能根据业务变化、法律法规更新或监管要求，对本隐私政策进行修订。如本政策发生重大变更，我们将通过应用内提示、弹窗、公告或其他合理方式通知您。
      </Text>

      <Text style={sectionH}>十三、联系我们</Text>
      <Text style={bullet}>• 运营主体：Learnflow学了么</Text>
      <Text style={bullet}>• 联系邮箱：j971117427@qq.com</Text>

      <Text style={{ height: 40 }} />
    </ScrollView>
  );
};

// ============ 服务条款（正式合规版） ============
export const TERMS_OF_SERVICE_CONTENT = () => {
  const { colors } = useTheme();
  const sectionH = { ..._sectionH, color: colors.textPrimary };
  const subSectionH = { ..._subSectionH, color: colors.textPrimary };
  const sectionB = { ..._sectionB, color: colors.textPrimary };
  const bullet = { ..._bullet, color: colors.textSecondary };
  const note = { ..._note, color: colors.textSecondary };
  const title = { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: colors.textPrimary };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      <Text style={title}>
        LearnFlow 用户服务协议
      </Text>
      <Text style={{ ...note, textAlign: 'center' }}>
        生效日期：2026年07月21日{'\n'}更新日期：2026年07月21日
      </Text>

      <Text style={sectionB}>
        欢迎您使用 LearnFlow - 沉浸式技能学习伴侣（以下简称"LearnFlow"或"本服务"）。本《用户服务协议》（以下简称"本协议"）由您与 Learnflow学了么 就您下载、安装、注册、登录、访问和使用 LearnFlow 相关产品与服务所订立。
      </Text>
      <Text style={sectionB}>
        在您注册、登录、访问或使用 LearnFlow 前，请您认真阅读并充分理解本协议全部内容。您一旦勾选同意、注册、登录或实际使用 LearnFlow，即视为您已阅读、理解并同意接受本协议全部内容。如您不同意本协议任何内容，请勿注册或使用 LearnFlow。
      </Text>

      <Text style={sectionH}>一、协议的适用范围</Text>
      <Text style={bullet}>• 本协议适用于您对 LearnFlow 产品、应用程序、网页、相关功能、内容、更新及后续服务的访问和使用。</Text>
      <Text style={bullet}>• 与 LearnFlow 相关的隐私政策、第三方信息共享清单、功能说明、页面提示、活动规则等，均为本协议不可分割的组成部分，与本协议具有同等法律效力。</Text>
      <Text style={bullet}>• 如相关页面规则与本协议不一致，以具体页面规则、单独说明或补充协议为准。</Text>

      <Text style={sectionH}>二、服务内容</Text>
      <Text style={sectionB}>
        LearnFlow 是一款技能学习辅助应用，主要提供以下功能：
      </Text>
      <Text style={bullet}>• 邮箱注册与登录；</Text>
      <Text style={bullet}>• 新手引导与学习初始化；</Text>
      <Text style={bullet}>• AI 生成技能树学习路径；</Text>
      <Text style={bullet}>• 学习进度记录与展示；</Text>
      <Text style={bullet}>• 数字宠物陪伴与互动；</Text>
      <Text style={bullet}>• AI 对话；</Text>
      <Text style={bullet}>• 番茄钟、学习笔记等学习工具；</Text>
      <Text style={bullet}>• 数独、推箱子等迷你游戏；</Text>
      <Text style={bullet}>• 学习资源链接跳转；</Text>
      <Text style={bullet}>• 帮助与反馈等支持服务。</Text>
      <Text style={sectionB}>
        我们有权根据业务运营需要，对服务内容、功能形式、页面布局、操作方式、服务接口等进行调整、升级、维护或优化。
      </Text>

      <Text style={sectionH}>三、用户注册与账号管理</Text>
      <Text style={subSectionH}>1. 注册条件</Text>
      <Text style={sectionB}>
        您应当具备与您行为相适应的民事行为能力。若您不具备相应民事行为能力，应在监护人同意和指导下使用本服务。
      </Text>
      <Text style={subSectionH}>2. 账号注册</Text>
      <Text style={sectionB}>
        目前 LearnFlow 支持通过邮箱地址进行注册和登录。您应当提供真实、准确、合法、有效的注册信息，并在信息变更时及时更新。
      </Text>
      <Text style={subSectionH}>3. 账号安全</Text>
      <Text style={bullet}>• 您应妥善保管账号、密码及登录凭证；</Text>
      <Text style={bullet}>• 您应对通过您的账号发生的一切操作行为承担责任；</Text>
      <Text style={bullet}>• 如您发现账号存在被盗用、异常登录或其他安全风险，应立即联系我们。</Text>
      <Text style={subSectionH}>4. 账号使用限制</Text>
      <Text style={bullet}>• 不得出借、出租、转让、售卖账号；</Text>
      <Text style={bullet}>• 不得冒用他人身份注册或使用账号；</Text>
      <Text style={bullet}>• 不得使用程序、脚本、外挂、接口工具等异常方式批量注册、登录或调用服务；</Text>
      <Text style={bullet}>• 不得实施影响平台正常运行或危害平台安全的行为。</Text>

      <Text style={sectionH}>四、用户行为规范</Text>
      <Text style={sectionB}>
        您在使用 LearnFlow 过程中，应遵守法律法规、公序良俗和本协议约定，不得利用本服务从事以下行为：
      </Text>
      <Text style={bullet}>• 发布、上传、传输、存储法律法规禁止的内容；</Text>
      <Text style={bullet}>• 危害国家安全、泄露国家秘密、破坏国家统一；</Text>
      <Text style={bullet}>• 散布谣言、扰乱社会秩序、宣扬暴力、淫秽、色情、赌博、恐怖主义、极端主义等内容；</Text>
      <Text style={bullet}>• 侮辱、诽谤他人，侵害他人名誉权、隐私权、知识产权等合法权益；</Text>
      <Text style={bullet}>• 利用 AI 对话、学习笔记、技能树生成等功能制作、传播不当内容；</Text>
      <Text style={bullet}>• 输入、上传、传播含病毒、木马、恶意代码、爬虫程序或其他危害系统安全的内容；</Text>
      <Text style={bullet}>• 干扰、破坏或试图绕过服务的正常运行机制、安全机制、风控机制；</Text>
      <Text style={bullet}>• 利用平台漏洞、规则缺陷、游戏机制异常进行不当获利；</Text>
      <Text style={bullet}>• 未经授权抓取、复制、镜像、传播、出售平台内容或数据；</Text>
      <Text style={bullet}>• 其他违反法律法规、监管要求或本协议约定的行为。</Text>

      <Text style={sectionH}>五、AI 功能与生成内容说明</Text>
      <Text style={subSectionH}>1. AI 功能性质</Text>
      <Text style={sectionB}>
        LearnFlow 提供的技能树生成、AI 对话等功能，属于基于人工智能技术生成或辅助生成的服务，其输出内容仅供学习参考，不构成任何专业建议、事实承诺或结果保证。
      </Text>
      <Text style={subSectionH}>2. 用户输入责任</Text>
      <Text style={sectionB}>
        您应对自己在 AI 功能中输入的内容负责。您不得输入违法违规内容、他人个人信息、商业秘密、保密信息或侵犯他人合法权益的内容。
      </Text>
      <Text style={subSectionH}>3. AI 输出限制</Text>
      <Text style={sectionB}>
        AI 输出可能存在不准确、不完整、滞后、偏差或不适配具体场景等情形。您应结合自身判断谨慎使用。对于因您依赖 AI 输出而产生的风险或损失，在法律允许范围内，我们不承担责任，但因我们故意或重大过失造成的除外。
      </Text>

      <Text style={sectionH}>六、学习资源链接与第三方服务说明</Text>
      <Text style={bullet}>• LearnFlow 中的部分学习内容可能包含第三方平台或第三方网页链接，仅作为学习资源参考入口。</Text>
      <Text style={bullet}>• 您点击相关链接后，将跳转至第三方平台或第三方页面，该等第三方由其自身独立运营和负责。</Text>
      <Text style={bullet}>• 第三方平台提供的内容、服务、产品、规则、隐私政策、数据处理方式等，均不受我们控制。</Text>
      <Text style={bullet}>• 您访问第三方链接后的行为及由此产生的争议、损失或责任，应由您与相应第三方自行解决。</Text>

      <Text style={sectionH}>七、知识产权</Text>
      <Text style={subSectionH}>1. 平台权利</Text>
      <Text style={sectionB}>
        LearnFlow 及其相关产品、技术、程序、页面设计、界面元素、文字、图片、图标、音视频、数据、文档、软件、商标、标识等相关权利，依法归我们或相关权利人所有。
      </Text>
      <Text style={subSectionH}>2. 用户内容</Text>
      <Text style={sectionB}>
        您在使用本服务过程中产生的笔记、学习记录、输入内容等，相关权利归属依法律规定和具体内容性质确定。为实现服务功能、展示内容、保障运行和优化服务，您授予我们在必要范围内使用该等内容的非排他、免费的许可，但该许可仅限于实现服务目的所必需的范围。
      </Text>
      <Text style={subSectionH}>3. 禁止行为</Text>
      <Text style={sectionB}>
        未经我们或相关权利人书面许可，您不得对平台内容实施复制、传播、改编、反向工程、反编译、反汇编、抓取、镜像或商业化使用等行为。
      </Text>

      <Text style={sectionH}>八、服务变更、中断与终止</Text>
      <Text style={sectionB}>
        我们有权根据业务发展、法律法规、技术升级、运营安排等需要，变更、中断、限制或终止全部或部分服务。在下列情形下，我们可能暂停或中断服务：系统维护/升级/迁移、网络/设备/系统故障、第三方服务故障、不可抗力、法律法规或监管要求等。
      </Text>

      <Text style={sectionH}>九、免责声明与责任限制</Text>
      <Text style={bullet}>• LearnFlow 按照现有技术和条件提供服务，不作任何明示或暗示的保证。</Text>
      <Text style={bullet}>• AI 生成内容、学习资源链接内容、第三方平台内容均可能存在偏差、错误、变化或失效，请您自行甄别和判断。</Text>
      <Text style={bullet}>• 因您自身原因、网络环境、设备故障、第三方平台原因、不可抗力、监管要求或其他非因我们故意或重大过失导致的损失，在法律允许范围内，我们不承担责任。</Text>

      <Text style={sectionH}>十、违约处理</Text>
      <Text style={sectionB}>
        如您违反本协议或相关法律法规，我们有权单方判断并采取一项或多项措施，包括但不限于：警示提醒、限制部分功能、删除相关内容、暂停或终止服务、封禁账号、向有关部门报告、保留追究法律责任的权利。
      </Text>

      <Text style={sectionH}>十一、未成年人使用</Text>
      <Text style={sectionB}>
        未成年人应在其监护人同意、指导和监督下使用 LearnFlow。监护人应合理管理未成年人的注册、登录和使用行为，并承担相应监护责任。
      </Text>

      <Text style={sectionH}>十二、协议的变更</Text>
      <Text style={sectionB}>
        我们有权根据业务变化、法律法规更新及监管要求，对本协议内容进行修订。修订后的协议将通过合理方式公布或提示。您在协议更新后继续使用 LearnFlow 的，视为您接受更新后的协议；如您不同意，应停止使用本服务。
      </Text>

      <Text style={sectionH}>十三、法律适用与争议解决</Text>
      <Text style={sectionB}>
        本协议的订立、生效、履行、解释及争议解决，适用中华人民共和国法律。因本协议产生的争议，双方应优先友好协商解决；协商不成的，任一方可向有管辖权的人民法院提起诉讼。
      </Text>

      <Text style={sectionH}>十四、联系我们</Text>
      <Text style={bullet}>• 运营主体：Learnflow学了么</Text>
      <Text style={bullet}>• 联系邮箱：971117427@qq.com</Text>

      <Text style={{ height: 40 }} />
    </ScrollView>
  );
};

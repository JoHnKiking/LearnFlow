import React from 'react';
import { ScrollView, Text } from 'react-native';

const sectionH = { fontSize: 16, fontWeight: '700' as const, marginBottom: 8, marginTop: 20 };
const sectionB = { fontSize: 14, lineHeight: 22 as const, marginBottom: 12 };
const bullet = { fontSize: 14, lineHeight: 22 as const, marginBottom: 6, paddingLeft: 8 };
const note = { fontSize: 12, lineHeight: 20 as const, marginBottom: 12, fontStyle: 'italic' as const };

// ============ 隐私政策 ============
export const PRIVACY_POLICY_CONTENT = () => (
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
    <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
      LearnFlow 隐私政策
    </Text>
    <Text style={{ ...note, textAlign: 'center' }}>
      生效日期：2026 年 6 月 27 日 {'\n'}最后更新：2026 年 6 月 27 日
    </Text>

    <Text style={sectionH}>一、信息收集与使用</Text>
    <Text style={sectionB}>
      我们深知个人信息对您的重要性。本隐私政策旨在向您说明 LearnFlow（以下简称"本平台"或"我们"）如何收集、使用、存储和保护您的个人信息。
    </Text>

    <Text style={{ ...sectionH, fontSize: 14, marginTop: 12 }}>
      1.1 您主动提供的信息
    </Text>
    <Text style={bullet}>• 注册信息：当您注册账户时，我们收集您的邮箱地址、用户名和密码（密码经过 bcrypt 加盐哈希存储，不可逆）。</Text>
    <Text style={bullet}>• 邮箱验证：我们通过 Nodemailer 发送验证码到您的邮箱以验证所有权，验证通过后不保留验证码。</Text>
    <Text style={bullet}>• 个人资料：您可选的昵称、头像等信息。</Text>
    <Text style={bullet}>• 学习数据：您选择的课程模块、技能树节点的学习进度。</Text>
    <Text style={bullet}>• 笔记内容：您在应用内撰写的学习笔记。</Text>
    <Text style={bullet}>• 怪兽互动：您与小怪兽的聊天对话内容。</Text>
    <Text style={bullet}>• 番茄钟记录：您的专注计时时长和完成记录。</Text>

    <Text style={{ ...sectionH, fontSize: 14, marginTop: 12 }}>
      1.2 自动收集的信息
    </Text>
    <Text style={bullet}>• 设备信息：当您发起网络请求时，我们记录客户端 IP 地址和 User-Agent 字符（用于安全日志和故障排查，不关联到具体用户身份）。</Text>
    <Text style={bullet}>• 请求日志：API 请求的方法、路径、响应状态码和耗时，用于性能监控。</Text>
    <Text style={bullet}>• 本地存储：应用使用 AsyncStorage 在您的设备本地存储登录凭证（JWT token）、怪兽数据、主题偏好等信息，不上传到服务器。</Text>

    <Text style={sectionH}>二、信息使用目的</Text>
    <Text style={bullet}>• 提供核心学习服务：技能树管理、番茄钟计时、怪兽陪伴学习。</Text>
    <Text style={bullet}>• 提供 AI 对话服务：通过 DeepSeek API 驱动怪兽聊天，对话内容用于生成回复，不用于其他目的。</Text>
    <Text style={bullet}>• 发送服务邮件：注册验证码、密码重置（如适用）等事务性邮件。</Text>
    <Text style={bullet}>• 安全保障：IP 日志用于识别和防御恶意请求、滥用行为。</Text>
    <Text style={bullet}>• 产品改进：匿名的使用统计用于优化学习体验。</Text>

    <Text style={sectionH}>三、信息存储与安全</Text>
    <Text style={bullet}>• 数据存储：您的账户数据存储在 MySQL 数据库中，部署于您指定的服务器上。</Text>
    <Text style={bullet}>• 密码安全：密码使用 bcrypt 算法加盐哈希后存储，明文密码不在任何环节留存。</Text>
    <Text style={bullet}>• 传输安全：生产环境通过 HTTPS/TLS 加密传输数据。</Text>
    <Text style={bullet}>• 数据保留：您有权随时删除账户，删除后所有关联数据将从数据库中移除（聊天记录、笔记、怪兽数据等）。</Text>

    <Text style={sectionH}>四、第三方服务</Text>
    <Text style={sectionB}>
      我们使用以下第三方服务来提供核心功能：
    </Text>
    <Text style={bullet}>• DeepSeek API：用于怪兽 AI 对话功能。您的聊天内容将发送至 DeepSeek 服务器进行处理，请参阅 DeepSeek 隐私政策了解其数据处理方式。</Text>
    <Text style={bullet}>• SMTP 邮件服务：用于发送验证码邮件，您的邮箱地址会传递给邮件服务商。</Text>
    <Text style={bullet}>• Expo Application Services (EAS)：用于应用的构建、更新和分发。</Text>
    <Text style={sectionB}>
      除上述必要情况外，我们不会将您的个人信息出售、出租或分享给任何第三方。
    </Text>

    <Text style={sectionH}>五、您的权利</Text>
    <Text style={bullet}>• 访问权：您可以查看您在应用中存储的个人信息。</Text>
    <Text style={bullet}>• 更正权：您可以修改昵称、头像等个人信息。</Text>
    <Text style={bullet}>• 删除权：您可以删除账户，所有关联数据将被移除。</Text>
    <Text style={bullet}>• 数据导出：您可以通过联系我们获取您数据的副本。</Text>

    <Text style={sectionH}>六、未成年人保护</Text>
    <Text style={sectionB}>
      本平台面向所有年龄段的学习者。如果您是未满 14 周岁的未成年人，请在监护人指导下使用本平台。我们不会故意收集 14 周岁以下儿童的个人信息。如果您是监护人且发现我们收集了此类信息，请联系我们删除。
    </Text>

    <Text style={sectionH}>七、政策更新</Text>
    <Text style={sectionB}>
      我们可能不时更新本隐私政策。更新后将在应用内通知您，重大变更可能需要您重新确认同意。
    </Text>

    <Text style={sectionH}>八、联系我们</Text>
    <Text style={sectionB}>
      如对本隐私政策有任何疑问，请通过应用内反馈渠道或邮件联系我们。
    </Text>

    <Text style={{ height: 40 }} />
  </ScrollView>
);

// ============ 服务条款 ============
export const TERMS_OF_SERVICE_CONTENT = () => (
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
    <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
      LearnFlow 服务条款
    </Text>
    <Text style={{ ...note, textAlign: 'center' }}>
      生效日期：2026 年 6 月 27 日
    </Text>

    <Text style={sectionH}>一、服务概述</Text>
    <Text style={sectionB}>
      LearnFlow（以下简称"本平台"）是由个人开发者运营的 AI 驱动学习平台，提供技能树管理、番茄钟专注计时、怪兽陪伴学习和 AI 对话等功能。使用本平台即表示您同意遵守本条款。如果您不同意本条款的任何部分，请停止使用本平台。
    </Text>

    <Text style={sectionH}>二、账户注册与安全</Text>
    <Text style={bullet}>• 您需要提供有效的邮箱地址完成注册，并通过邮箱验证码验证邮箱所有权。</Text>
    <Text style={bullet}>• 您对账户下的所有活动负责，包括学习笔记内容、与小怪兽的对话内容。</Text>
    <Text style={bullet}>• 您不得使用本平台从事任何违法活动，包括但不限于：发布违法内容、骚扰他人、侵犯知识产权、发送垃圾信息。</Text>
    <Text style={bullet}>• 我们保留因违反条款而暂停或终止账户服务的权利。</Text>

    <Text style={sectionH}>三、服务内容</Text>
    <Text style={{ ...sectionH, fontSize: 14, marginTop: 12 }}>
      3.1 免费服务
    </Text>
    <Text style={bullet}>• 账户注册与登录</Text>
    <Text style={bullet}>• 选择最多 3 个学习模块</Text>
    <Text style={bullet}>• 技能树浏览与进度跟踪</Text>
    <Text style={bullet}>• 番茄钟专注计时</Text>
    <Text style={bullet}>• 小怪兽陪伴与基础对话</Text>
    <Text style={bullet}>• 学习笔记记录</Text>

    <Text style={{ ...sectionH, fontSize: 14, marginTop: 12 }}>
      3.2 Pro 会员服务（如适用）
    </Text>
    <Text style={bullet}>• 无限能量累积与每日能量奖励</Text>
    <Text style={bullet}>• 更多每日游戏次数</Text>
    <Text style={bullet}>• 扩展的怪兽自定义选项</Text>
    <Text style={bullet}>• Pro 标识与专属权益</Text>

    <Text style={{ ...sectionH, fontSize: 14, marginTop: 12 }}>
      3.3 服务可用性
    </Text>
    <Text style={bullet}>• 我们尽力保证服务的稳定运行，但不承诺服务无中断。</Text>
    <Text style={bullet}>• DeepSeek AI 对话功能依赖第三方 API，可能受其服务状态影响。</Text>
    <Text style={bullet}>• 我们可能因维护、升级或其他原因暂停服务，将尽可能提前通知。</Text>

    <Text style={sectionH}>四、知识产权</Text>
    <Text style={bullet}>• 本平台的所有代码、设计、界面和品牌元素（包括怪兽形象、星球 UI 设计等）的著作权归开发者所有。</Text>
    <Text style={bullet}>• 您在平台内创建的学习笔记、自定义模块等内容，其著作权归您所有。您授予我们展示和存储这些内容的必要权利（仅用于提供服务）。</Text>
    <Text style={bullet}>• 您不得复制、修改、分发、出售或租赁本平台的任何部分。</Text>

    <Text style={sectionH}>五、用户行为规范</Text>
    <Text style={sectionB}>
      您同意不从事以下行为：
    </Text>
    <Text style={bullet}>• 使用自动化工具（爬虫、脚本等）批量访问或抓取本平台内容。</Text>
    <Text style={bullet}>• 利用本平台的 AI 功能生成违法、侵权、诽谤、淫秽、歧视性内容。</Text>
    <Text style={bullet}>• 干扰或破坏本平台的服务器、网络或安全措施。</Text>
    <Text style={bullet}>• 冒充他人或虚假陈述您与个人或实体的关系。</Text>
    <Text style={bullet}>• 将本平台用于任何商业目的（未经我们明确书面许可）。</Text>

    <Text style={sectionH}>六、免责声明</Text>
    <Text style={bullet}>• 本平台按"现状"提供服务，不作任何明示或暗示的保证。</Text>
    <Text style={bullet}>• AI 对话内容由 DeepSeek 模型生成，我们不对 AI 回复的准确性、完整性或适当性承担责任。</Text>
    <Text style={bullet}>• 我们不对因使用本平台导致的任何直接或间接损失负责（在法律允许的最大范围内）。</Text>
    <Text style={bullet}>• Pro 会员服务的具体权益可能随版本更新调整。</Text>

    <Text style={sectionH}>七、终止与变更</Text>
    <Text style={bullet}>• 您可以随时通过删除账户终止使用本平台。</Text>
    <Text style={bullet}>• 我们保留随时修改本条款的权利。重大变更将通过应用内通知告知。</Text>
    <Text style={bullet}>• 继续使用本平台即表示您接受修改后的条款。</Text>

    <Text style={sectionH}>八、适用法律</Text>
    <Text style={sectionB}>
      本条款受中华人民共和国法律管辖。因本条款引起的争议，双方应友好协商解决；协商不成的，提交开发者所在地有管辖权的人民法院诉讼解决。
    </Text>

    <Text style={sectionH}>九、联系我们</Text>
    <Text style={sectionB}>
      如对本服务条款有任何疑问，请通过应用内反馈渠道或邮件联系我们。
    </Text>

    <Text style={{ height: 40 }} />
  </ScrollView>
);

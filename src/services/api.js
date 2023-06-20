import { HTTP, GetImage } from "@/utils/axios";

// 用户登录
export const AdminLogin = (data) => HTTP(`/auth/login/`, data);

// 心跳保活
export const HeartBeat = (data) => HTTP(`/auth/heartbeat/`, data);

// 退出登录
export const LoginOut = (data) => HTTP(`/auth/logout/`, data);

// 获取病例列表
export const GetPatientByPage = (data) =>
  HTTP(`/api/get_patient_by_page/`, data);

// 获取病例信息
export const GetPatientInformation = (data) => HTTP(`/api/get_patient/`, data);

// 获取病例信息
export const ModifyPatient = (data) => HTTP(`/api/modify_patient/`, data);

// 获取病例玻片名称列表
export const GetSlideNames = (data) => HTTP(`/api/get_slide_names/`, data);

// 获取病例的核型图
export const GetKaryotypeByPatient = (data) =>
  HTTP(`/api/get_karyotype_by_patient/`, data);

// 获取病例核型图统计信息
export const GetKaryotypeStatistic = (data) =>
  HTTP(`/api/get_karyotype_statistic/`, data);

// 更新核型表达式
export const SaveKaryotypeStatistic = (data) =>
  HTTP(`/api/save_karyotype_expression/`, data);

// 置顶/取消置顶
export const SetIstop = (data) => HTTP(`/api/set_istop/`, data);

// 设置核型图颜色标记
export const SetColor = (data) => HTTP(`/api/set_color/`, data);

// 锁定病例资源
export const LockPatient = (data) => HTTP(`/api/lock_patient/`, data);
// 释放病例资源
export const ReleasePatient = (data) => HTTP(`/api/release_patient/`, data);

// 获取核型图染色体列表信息
export const GetChromosomeInfos = (data) =>
  HTTP(`/api/get_chromosome_infos/`, data);

// 获取核型图信息
export const GetKaryotype = (data) => HTTP(`/api/get_karyotype/`, data);

// 核型图确认计数
export const ConfirmCount = (data) => HTTP(`/api/confirm_count/`, data);

// 核型图取消确认计数
export const CancelCount = (data) => HTTP(`/api/cancel_confirm_count/`, data);

// 保存核型图分析结果
export const SaveKaryotype = data => HTTP(`/api/confirm_analysis/`, data)

// 核型图取消确认分析
export const CancelKaryotype = data => HTTP(`/api/cancel_confirm_analysis/`, data)

// 重新排序
export const SetGroupSort = (data) => HTTP(`/api/drag_chromosome/`, data);

// 删除染色体
export const DeleteChromosome = (data) => HTTP(`/api/delete_chromosome/`, data);

//导出样本
export const ExportSample = data => GetImage(`/api/export_sample/`, data);

// 核型图中染色体水平翻转
export const FlipChromo = (data) => HTTP(`/api/flip_chromo/`, data);

// 核型图中染色体上下左右翻转
export const FlipInvertChromo = (data) => HTTP(`/api/flip_invert_chromo/`, data);

// 核型图中染色体上下翻转
export const InvertChromo = (data) => HTTP(`/api/invert_chromo/`, data);

// 自动分析核型图
export const AutoAnalysisKaryo = (data) => HTTP(`/api/auto_analysis_karyotype/`, data);

// 删除核型图
export const DeleteKaryotype = (data) => HTTP(`/api/delete_karyotype/`, data);

//心跳保活
export const heartbeat = (data) => HTTP(`/auth/heartbeat/`, data);

//挑战加密狗
export const ChallengeSoftdog = (data) => HTTP(`/auth/challenge_softdog/`, data);

//校验加密狗
export const ValidateSoftdog = (data) => HTTP(`/auth/validate_softdog/`, data);

///自定义模板

//保存模板
export const SaveTemplete = (data) => HTTP(`/report/save_templete/`, data);

//获取单个模板
export const getTemplete = (data) => HTTP(`/report/get_templete/`, data);

//获取全部模板
export const getAllTempletes = (data) =>
  HTTP(`/report/get_all_templetes/`, data);

//获取已发布的模板
export const GetPublishedTempletes = (data) =>
  HTTP(`/report/get_published_templetes/`, data);

//发布模板
export const publishTemplete = (data) =>
  HTTP(`/report/publish_templete/`, data);

//设置默认报告
export const defaultReport = (data) => HTTP(`/report/set_default/`, data);

//删除模板
export const deleteTemplete = (data) => HTTP(`/report/delete_templete/`, data);

// 复制模板
export const copyTemplete = data => HTTP(`/report/copy_templete/`, data)
 
//判断是否出具报告
export const IsReported = (data) => HTTP(`/api/is_reported/`, data);
//保存报告
export const SaveReport = (data) => HTTP(`/report/save_report/`, data);

//获取报告
export const getReport = (data) => HTTP(`/report/get_report/`, data);

//发布报告
export const publishReport = (data) => HTTP(`/report/publish_Report/`, data);

//删除报告
export const deleteReport = (data) => HTTP(`/report/delete_Report/`, data);

//初始化报告
export const initReport = (data) => HTTP(`/report/init_report/`, data);

//获取核型优化图
export const getOptimizeImage = (data) => HTTP(`/report/get_karyotype_optimize_image/`, data, 'get', true);

//获取核型排列图
export const getArrangeImage = (data) => HTTP(`/report/get_karyotype_arrange_image/`, data, 'get', true);

//获取核型分析信息
export const GetKaryotypeAnalysisInfos = (data) =>
  HTTP(`/report/get_karyotype_analysis_infos/`, data);

// 旋转角度
export const RotateChromo = data => HTTP(`/api/rotate_chromo/`, data)

// 新增染色体计数点
export const AddCountPoint = data => HTTP(`/api/add_count_point/`, data)

// 删除染色体计数点
export const DeleteCountPoint = data => HTTP(`/api/delete_count_point/`, data)

// 清空染色体计数
export const ClearCountPoint = data => HTTP(`/api/clear_count_point/`, data)

// 获取用户列表
export const getAllusers = data => HTTP(`/user/get_user_list/`, data)

// 获取用户
export const getUser = data => HTTP(`/user/get_user/`, data)

// 新增用户
export const addUser = data => HTTP(`/user/add_user/`, data)

//更新用户
export const modifyUser = data => HTTP(`/user/modify_user/`, data)

//删除用户
export const deleteUser = data => HTTP(`/user/delete_user/`, data)

//禁用/取消禁用用户
export const setDisable = data => HTTP(`/user/set_disable/`, data)

//重置密码
export const modifyPassword = data => HTTP(`/user/modify_password/`, data)

//重置密码123456
export const resetPassword = data => HTTP(`/user/reset_password/`, data)

//获取用户信息
export const get_cur_user = data => HTTP(`/user/get_cur_user/`, data)

// 染色体对比
export const ChromosomeCompare = data => HTTP(`/api/chromosome_compare/`, data)

// 分割染色体
export const SegmentChromo = data => HTTP(`/api/segment_chromo/`, data)

// 涂抹
export const EraseChromo = data => HTTP(`/api/add_chromo_by_smear/`, data)

// 获取用户上传样本分析进度
export const GetAnalysisProgress = data => HTTP(`/api/get_analysis_progress/`, data)

// 获取加密狗配置
export const GetConfig = data => HTTP(`/auth/get_config/`, data)

// 获取加密狗配置
export const CheckDog = data => HTTP(`/auth/check_softdog/`, data)

// 上传样本文件控制信号
export const UploadSampleControl = data => HTTP(`/api/upload_sample_control/`, data)

// 待排区分布
export const ArrangeUnclassified = data => HTTP(`/api/arrange_unclassified/`, data)

// 擦除染色体
export const HandleEraseChromo = data => HTTP(`/api/erase_chromo/`, data)

// 重新自动分析
export const ReAutoAnalysis = data => HTTP(`/api/re_auto_analysis/`, data)

// 追加自动分析
export const AppendAnalysis = data => HTTP(`/api/append_analysis/`, data, 'post', false, 500 * 1000)

// 删除病例
export const DelPatient = data => HTTP(`/api/delete_patient/`, data)
// 导出
export const ExportKaryotype = data => GetImage(`/api/export_karyotype/`, data)

// 导出Lis
export const ReportToLis = data => HTTP(`/report/report_to_lis/`, data)

// 染色体添加箭头
export const SaveArrow = data => HTTP(`/api/add_arrow/`, data)


//获取统计页面信息字段信息
export const GetStatisticFieldInfo = data => HTTP(`/statistics/get_statistic_field_info/`, data)

// 保存统计页面信息字段信息
export const SaveStatisticFieldInfo = data => HTTP(`/statistics/save_selected_statistic_fields/`, data)

//统计页面分页查询
export const GetStatisticByPage = data => HTTP(`/statistics/get_statistic_by_page/`, data)

//导出统计信息
export const ExportStatisticByPage = data => GetImage(`/statistics/export_statistic_info/`, data)

// 删除未确认分析的核型图
export const DeleteUnconfirmedAnalysed = data => HTTP(`/api/delete_unconfirmed_analysed/`, data)

// 删除未确认计数的核型图
export const DeleteUnconfirmedCounted = data => HTTP(`/api/delete_unconfirmed_counted/`, data)

// 批量删除核型图
export const DeleteBatchKaryotype = data => HTTP(`/api/batch_delete_karyotype/`, data)
// 删除样本玻片（该玻片下所有核型图将被删除）
export const DeleteSlide = data => HTTP(`/api/delete_slide/`, data)

// 进入核型分析页（主要用于回退和重做功能）
export const EnterAnalysisPage = data => HTTP(`/api/enter_analysis_page/`, data)

// 回退操作
export const Undo = data => HTTP(`/api/undo/`, data)

// 重做操作
export const Redo = data => HTTP(`/api/redo/`, data)

// 是否核验
export const SetRecheck = data => HTTP(`/api/set_recheck/`, data)

// 合并染色体
export const MergeChrome = data => HTTP(`/api/merge_chromo/`, data)

// 图像优化调整
export const OptimizeImage = data => HTTP(`/api/optimize_image/`, data)

// 删除箭头
export const DeleteArrow = data => HTTP(`/api/delete_arrow/`, data)

// 修改备注
export const ModifyArrowComment = data => HTTP(`/api/modify_arrow_comment/`, data)
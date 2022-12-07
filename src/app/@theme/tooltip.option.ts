export const TOOLTIP_OPTIONS = {
  showItemMarker: false,
  triggerOn: ['touchstart', 'touchmove'], // tooltip 出现的触发行为，可自定义，用法同 legend 的 triggerOn
  triggerOff: 'touchend', // 消失的触发行为，可自定义
  background: {
    radius: 2,
    fill: '#1890FF',
    padding: [6, 10]
  }, // tooltip 内容框的背景样式
  titleStyle: {
    fontSize: 10,
    fill: '#fff',
    lineHeight: 16,
    textAlign: 'start',
    textBaseline: 'top'
  }, // tooltip 标题的文本样式配置，showTitle 为 false 时不生效
  nameStyle: {
    fontSize: 10,
    fill: '#fff',
    lineHeight: 16,
    textAlign: 'start',
    textBaseline: 'middle'
  }, // tooltip name 项的文本样式配置
  valueStyle: {
    fontSize: 10,
    fill: '#fff',
    lineHeight: 18,
    textAlign: 'start',
    textBaseline: 'middle'
  }
};

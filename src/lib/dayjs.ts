import lib from 'dayjs'
import 'dayjs/locale/es'
import relativeTime from 'dayjs/plugin/relativeTime'

lib.locale('es')
lib.extend(relativeTime)

export const dayjs = lib

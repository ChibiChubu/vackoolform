import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

const Calendar = ({ className, ...props }) => {
  return (
    <DayPicker 
      className={`${className} bg-white`}
      modifiersClassNames={{
        selected: 'bg-black text-white',
        today: 'font-bold',
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
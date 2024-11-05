import * as React from "react"

const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 rounded-md font-medium text-sm ${
        props.variant === "outline"
          ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : "bg-black text-white hover:bg-gray-800"
      } ${className}`}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center items-center bg-gray-900 text-white p-12">
        <div className="max-w-md space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tighter">StyleAI</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Revolutionizing Fashion with AI
          </h1>
          <p className="text-lg text-gray-400">
            Join our ecosystem of customers, tailors, shopkeepers, and delivery partners to experience the next generation of personalized fashion.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}

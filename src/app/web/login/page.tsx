import LoginForm from "@/components/login-form/LoginForm";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-center bg-gray-900">
        <LoginForm />
      </div>
      <div className="w-1/2 bg-black"></div>
    </div>
  );
}

export default LandingPage;

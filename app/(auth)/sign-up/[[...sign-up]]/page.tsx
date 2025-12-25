import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="animate-in fade-in zoom-in duration-500">
                <SignUp routing="path" path="/sign-up" />
            </div>
        </div>
    );
}
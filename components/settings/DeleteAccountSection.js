"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";

export default function DeleteAccountSection() {
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");

    const isConfirmValid = confirmText === "DELETE MY ACCOUNT";

    async function handleDelete() {
        if (!isConfirmValid || !password) {
            toast.error("Please fill in all fields correctly");
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch("/api/profile/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, confirmText })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Account deleted successfully");
                // Sign out and redirect to home
                setTimeout(() => {
                    signOut({ callbackUrl: "/" });
                }, 1500);
            } else {
                throw new Error(data.error || "Failed to delete account");
            }
        } catch (error) {
            toast.error(error.message);
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow border border-red-200 dark:border-red-900/50">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-900/50 pb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                </h3>

                <div className="mt-4 space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
                        <h4 className="font-medium text-red-800 dark:text-red-300">Delete Account</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Once you delete your account, there is no going back. All your data will be permanently removed.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="destructive"
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                        onClick={() => setShowModal(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete My Account
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="h-6 w-6" />
                                    Delete Account
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
                                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                        ⚠️ This action is irreversible!
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                        Deleting your account will:
                                    </p>
                                    <ul className="text-sm text-red-600 dark:text-red-400 mt-2 list-disc list-inside space-y-1">
                                        <li>Remove all your personal data</li>
                                        <li>Delete your profile and preferences</li>
                                        <li>Remove access to all services</li>
                                        <li>Cancel any pending orders</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delete-password">Enter your password</Label>
                                    <Input
                                        id="delete-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your current password"
                                        className="border-red-200 focus:border-red-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-text">
                                        Type <span className="font-mono font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
                                    </Label>
                                    <Input
                                        id="confirm-text"
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="DELETE MY ACCOUNT"
                                        className={`font-mono ${isConfirmValid ? 'border-green-500 bg-green-50' : 'border-red-200'}`}
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowModal(false)}
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        onClick={handleDelete}
                                        disabled={!isConfirmValid || !password || deleting}
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Forever
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

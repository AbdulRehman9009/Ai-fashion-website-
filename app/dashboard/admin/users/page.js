"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users, Search, UserCheck, UserX, Key, Trash2, Plus, Loader2,
    User, Scissors, Store, Truck, Shield
} from "lucide-react";
import { toast } from "react-toastify";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("ALL");
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionDialog, setActionDialog] = useState({ open: false, action: null, user: null });
    const [createDialog, setCreateDialog] = useState(false);
    const [newUser, setNewUser] = useState({ email: "", name: "", role: "USER", password: "" });

    const roleConfig = {
        USER: { label: "Customer", icon: User, color: "bg-blue-100 text-blue-800" },
        TAILOR: { label: "Tailor", icon: Scissors, color: "bg-purple-100 text-purple-800" },
        SHOPKEEPER: { label: "Shopkeeper", icon: Store, color: "bg-orange-100 text-orange-800" },
        DELIVERY: { label: "Delivery", icon: Truck, color: "bg-green-100 text-green-800" },
        ADMIN: { label: "Admin", icon: Shield, color: "bg-red-100 text-red-800" }
    };

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedRole !== "ALL") params.append("role", selectedRole);

            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                toast.error("Failed to load users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Could not load users");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, user) => {
        setActionDialog({ open: true, action, user });
    };

    const confirmAction = async () => {
        const { action, user } = actionDialog;

        try {
            if (action === "activate" || action === "deactivate") {
                const res = await fetch(`/api/admin/users/${user._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: action === "activate" ? "ACTIVE" : "SUSPENDED"
                    })
                });

                if (res.ok) {
                    toast.success(`User ${action === "activate" ? "activated" : "deactivated"} successfully`);
                    fetchUsers();
                } else {
                    throw new Error("Action failed");
                }
            } else if (action === "reset") {
                const res = await fetch(`/api/admin/users/${user._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resetPassword: true })
                });

                const data = await res.json();
                if (res.ok) {
                    toast.success(`Password reset! Temporary password: ${data.tempPassword}`);
                    navigator.clipboard.writeText(data.tempPassword);
                } else {
                    throw new Error("Password reset failed");
                }
            } else if (action === "delete") {
                const res = await fetch(`/api/admin/users/${user._id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    toast.success("User deleted successfully");
                    fetchUsers();
                } else {
                    throw new Error("Delete failed");
                }
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionDialog({ open: false, action: null, user: null });
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success(`Role updated to ${roleConfig[newRole]?.label || newRole}`);
                fetchUsers();
            } else {
                throw new Error("Role update failed");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                toast.success("User created successfully!");
                setCreateDialog(false);
                setNewUser({ email: "", name: "", role: "USER", password: "" });
                fetchUsers();
            } else {
                const data = await res.json();
                throw new Error(data.error || "Failed to create user");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const roleGroups = {
        ALL: filteredUsers,
        USER: filteredUsers.filter(u => u.role === "USER"),
        TAILOR: filteredUsers.filter(u => u.role === "TAILOR"),
        SHOPKEEPER: filteredUsers.filter(u => u.role === "SHOPKEEPER"),
        DELIVERY: filteredUsers.filter(u => u.role === "DELIVERY"),
        ADMIN: filteredUsers.filter(u => u.role === "ADMIN")
    };

    const UserCard = ({ user }) => {
        const config = roleConfig[user.role];
        const RoleIcon = config?.icon || User;

        return (
            <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${config?.color || "bg-gray-100"} flex items-center justify-center flex-shrink-0`}>
                                {user.image ? (
                                    <img src={user.image} className="h-full w-full object-cover rounded-full" alt={user.name} />
                                ) : (
                                    <RoleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-base sm:text-lg truncate">{user.name || "No Name"}</h3>
                                    {user.status === "SUSPENDED" && (
                                        <Badge variant="destructive">Suspended</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                {/* Inline Role Change */}
                                <div className="mt-2">
                                    <Select
                                        value={user.role}
                                        onValueChange={(value) => handleRoleChange(user._id, value)}
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER">Customer</SelectItem>
                                            <SelectItem value="TAILOR">Tailor</SelectItem>
                                            <SelectItem value="SHOPKEEPER">Shopkeeper</SelectItem>
                                            <SelectItem value="DELIVERY">Delivery</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            {user.status === "ACTIVE" ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                                    onClick={() => handleAction("deactivate", user)}
                                >
                                    <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Deactivate</span>
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
                                    onClick={() => handleAction("activate", user)}
                                >
                                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    <span className="hidden sm:inline">Activate</span>
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm"
                                onClick={() => handleAction("reset", user)}
                            >
                                <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Reset</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleAction("delete", user)}
                            >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                        <p className="text-gray-500">Manage all users across the platform</p>
                    </div>
                </div>

                <Button onClick={() => setCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="USER">Customers</SelectItem>
                                <SelectItem value="TAILOR">Tailors</SelectItem>
                                <SelectItem value="SHOPKEEPER">Shopkeepers</SelectItem>
                                <SelectItem value="DELIVERY">Delivery</SelectItem>
                                <SelectItem value="ADMIN">Admins</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <Tabs defaultValue="ALL" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="ALL">All ({roleGroups.ALL.length})</TabsTrigger>
                        <TabsTrigger value="USER">Customers ({roleGroups.USER.length})</TabsTrigger>
                        <TabsTrigger value="TAILOR">Tailors ({roleGroups.TAILOR.length})</TabsTrigger>
                        <TabsTrigger value="SHOPKEEPER">Shops ({roleGroups.SHOPKEEPER.length})</TabsTrigger>
                        <TabsTrigger value="DELIVERY">Delivery ({roleGroups.DELIVERY.length})</TabsTrigger>
                        <TabsTrigger value="ADMIN">Admins ({roleGroups.ADMIN.length})</TabsTrigger>
                    </TabsList>

                    {Object.keys(roleGroups).map(role => (
                        <TabsContent key={role} value={role} className="space-y-4">
                            {roleGroups[role].length === 0 ? (
                                <Card>
                                    <CardContent className="p-12 text-center text-gray-500">
                                        No users found in this category
                                    </CardContent>
                                </Card>
                            ) : (
                                roleGroups[role].map(user => <UserCard key={user._id} user={user} />)
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {/* Action Confirmation Dialog */}
            <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, action: null, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.action === "activate" && "Activate User"}
                            {actionDialog.action === "deactivate" && "Deactivate User"}
                            {actionDialog.action === "reset" && "Reset Password"}
                            {actionDialog.action === "delete" && "Delete User"}
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.action === "activate" && "This user will be able to access their account again."}
                            {actionDialog.action === "deactivate" && "This user will not be able to log in."}
                            {actionDialog.action === "reset" && "A temporary password will be generated and copied to clipboard."}
                            {actionDialog.action === "delete" && "This action cannot be undone. The user and all their data will be permanently deleted."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, user: null })}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAction} className={actionDialog.action === "delete" ? "bg-red-600 hover:bg-red-700" : ""}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the platform</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={newUser.name}
                                onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser(p => ({ ...p, role: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">Customer</SelectItem>
                                    <SelectItem value="TAILOR">Tailor</SelectItem>
                                    <SelectItem value="SHOPKEEPER">Shopkeeper</SelectItem>
                                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

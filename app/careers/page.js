import { Briefcase, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
    const jobs = [
        { title: "Senior React Developer", department: "Engineering", location: "Remote", type: "Full-time" },
        { title: "Fashion Designer Consultant", department: "Design", location: "New York, NY", type: "Contract" },
        { title: "Customer Success Manager", department: "Operations", location: "Remote", type: "Full-time" },
        { title: "AI Research Scientist", department: "Data Science", location: "San Francisco, CA", type: "Full-time" },
    ];

    return (
        <div className="min-h-screen bg-white py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
                    <p className="text-xl text-gray-600">
                        Help us revolutionize the fashion industry with technology and craftsmanship.
                    </p>
                </div>

                <div className="space-y-4">
                    {jobs.map((job, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                            <div className="mb-4 md:mb-0 text-center md:text-left">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 justify-center md:justify-start">
                                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.department}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                    <span className="px-2 py-0.5 bg-white rounded border text-xs">{job.type}</span>
                                </div>
                            </div>
                            <Link href="#" className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                Apply Now
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-blue-600 rounded-2xl p-10 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">Don't see the right role?</h3>
                    <p className="mb-8 text-blue-100">
                        We are always looking for talented individuals. Send us your resume and we will keep you in mind.
                    </p>
                    <Link href="mailto:careers@example.com" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                        Email Us <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

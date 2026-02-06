
import React, { useState, useEffect, useRef } from 'react';
import GlassCard from './GlassCard';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';

const ProfilePage: React.FC = () => {
  const { token, login, user: contextUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'campus'>('personal');
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bio: '',
    dob: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/v1/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setFormData({
            phone: data.data.phone || '',
            address: data.data.address || '',
            bio: data.data.bio || '',
            dob: data.data.dob ? new Date(data.data.dob).toISOString().split('T')[0] : ''
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save Profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/profile/update', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(curr => ({ ...curr, ...data.data } as StudentProfile));
        alert("Profile updated successfully!");
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large (Max 5MB)");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError("Invalid file type. Use JPG/PNG.");
      return;
    }
    setUploadError(null);

    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await fetch('http://localhost:4000/api/v1/profile/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      
      if (result.success) {
        // Optimistic UI Update or Refetch
        if (profile) {
            const updatedProfile = { ...profile, avatarUrl: result.avatarUrl };
            setProfile(updatedProfile);
            // Update global context so sidebar avatar updates instantly
            if (contextUser) {
                login(token!, { ...contextUser, avatar: result.avatarUrl });
            }
        }
      }
    } catch (err) {
      setUploadError("Upload failed");
    }
  };

  if (isLoading) return <div className="text-center p-10 text-gray-500">Loading Profile...</div>;
  if (!profile) return <div className="text-center p-10 text-red-500">Profile not found.</div>;

  const avatarUrl = profile.avatarUrl 
    ? `http://localhost:4000${profile.avatarUrl}` 
    : `https://ui-avatars.com/api/?name=${profile.user?.name}&background=0D8ABC&color=fff`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <GlassCard className="border-t-4 border-t-blue-500">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {/* Edit Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0010.07 4h3.86a2 2 0 001.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
            />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-display font-bold text-gray-900">{profile.user?.name}</h1>
            <p className="text-gray-500 font-medium">{profile.department} • Semester {profile.semester}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">{profile.user?.role}</span>
                <span className="text-gray-400 text-sm">{profile.user?.regNo}</span>
            </div>
            {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
          </div>

          <div className="flex gap-3">
             <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Personal Info
             </button>
             <button onClick={() => setActiveTab('campus')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'campus' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Campus Info
             </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Form Area */}
         <div className="lg:col-span-2">
            <GlassCard title={activeTab === 'personal' ? 'Personal Details' : 'Campus Information'}>
                {activeTab === 'personal' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input type="text" value={profile.user?.name} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input type="email" value={profile.user?.email} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                                <input 
                                    type="date" 
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Tell us a bit about yourself..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Permanent Address</label>
                            <input 
                                type="text" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : null}
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                             <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             <div>
                                <h4 className="text-sm font-bold text-yellow-800">Read-Only Information</h4>
                                <p className="text-xs text-yellow-700">Campus details are managed by the administration. Contact Academic Office for corrections.</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <div className="border-b border-gray-100 pb-2">
                                <label className="block text-xs text-gray-400 uppercase mb-1">Hostel</label>
                                <p className="font-bold text-gray-800">{profile.hostelName || "Not Assigned"}</p>
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <label className="block text-xs text-gray-400 uppercase mb-1">Room Number</label>
                                <p className="font-bold text-gray-800">{profile.roomNumber || "--"}</p>
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <label className="block text-xs text-gray-400 uppercase mb-1">Warden</label>
                                <p className="font-bold text-gray-800">{profile.wardenName || "N/A"}</p>
                            </div>
                            <div className="border-b border-gray-100 pb-2">
                                <label className="block text-xs text-gray-400 uppercase mb-1">Course</label>
                                <p className="font-bold text-gray-800">{profile.course || "--"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </GlassCard>
         </div>

         {/* Sidebar / Stats */}
         <div className="space-y-6">
            <GlassCard title="Security">
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-300">Password</span>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Change</button>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-300">2FA Status</span>
                        <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">Disabled</span>
                    </div>
                    <button className="w-full mt-2 py-2 text-xs font-bold text-gray-300 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition-colors">
                        Manage Trusted Devices
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-none">
                 <h3 className="text-white font-bold mb-2">Student ID Card</h3>
                 <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">N</div>
                        <div>
                            <p className="text-white font-bold text-sm">Nexus University</p>
                            <p className="text-blue-200 text-xs">Valid till 2026</p>
                        </div>
                    </div>
                    <p className="font-mono text-xl text-white tracking-widest mb-1">{profile.user?.regNo}</p>
                    <p className="text-xs text-gray-300 uppercase">Registration Number</p>
                 </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
};

export default ProfilePage;

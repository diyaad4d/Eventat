import React, { useState, useRef } from 'react';
import { Camera, Save, AlertTriangle, X, Key, Mail, MapPin, User, Phone, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore'; // Assuming this exists to get current user data

function CustomerProfile() {
  const { user } = useAuthStore(); // Fallback to empty strings if null
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar_url || 'https://i.pravatar.cc/150?img=5');
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: user?.full_name || 'Ahmad Client',
    username: user?.username || 'ahmad_99',
    phone: user?.phone || '+962 79 000 0000',
    address: 'Mecca Street',
    city: 'Amman',
  });

  const [securityData, setSecurityData] = useState({
    email: user?.email || 'ahmad@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a fake local URL for the UI preview
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const renderDeleteModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-dark)] mb-2">Delete Account?</h2>
          <p className="text-gray-500 mb-6">This action cannot be undone. All your data, event plans, and booking history will be permanently deleted.</p>
          <div className="flex flex-col gap-3">
            <button className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
              Yes, Delete My Account
            </button>
            <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* ── Personal Information Card ── */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-[var(--color-dark)] flex items-center gap-2">
              <User size={18} className="text-[var(--color-gold)]" /> Personal Information
            </h2>
          </div>
          
          <div className="p-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-dark)]">Profile Photo</h3>
                <p className="text-sm text-gray-500 mt-0.5 mb-2">Recommended: Square JPG, PNG. Max 2MB.</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors">
                  Upload new photo
                </button>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">City</label>
                  <select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm">
                    <option value="Amman">Amman</option>
                    <option value="Irbid">Irbid</option>
                    <option value="Zarqa">Zarqa</option>
                    <option value="Balqa">Balqa (Salt)</option>
                    <option value="Madaba">Madaba</option>
                    <option value="Karak">Karak</option>
                    <option value="Tafilah">Tafilah</option>
                    <option value="Ma'an">Ma'an</option>
                    <option value="Aqaba">Aqaba</option>
                    <option value="Mafraq">Mafraq</option>
                    <option value="Jerash">Jerash</option>
                    <option value="Ajloun">Ajloun</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-[var(--color-gold)] text-white font-bold rounded-xl hover:bg-[var(--color-gold-dark)] shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all disabled:opacity-70">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        {/* ── Security Settings Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-[var(--color-dark)] flex items-center gap-2">
              <Key size={18} className="text-[var(--color-gold)]" /> Security & Email
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Email Section */}
            <div>
              <h3 className="text-sm font-bold text-[var(--color-dark)] mb-4">Email Address</h3>
              <div className="relative mb-3">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={securityData.email} onChange={(e) => setSecurityData({...securityData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
              </div>
              <button className="text-sm font-bold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors">
                Update Email Address
              </button>
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-sm font-bold text-[var(--color-dark)] mb-4">Change Password</h3>
              <div className="flex flex-col gap-4">
                <input type="password" placeholder="Current Password" value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                <input type="password" placeholder="New Password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                <input type="password" placeholder="Confirm New Password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-all text-sm" />
                <button className="w-max px-6 py-2.5 bg-[var(--color-dark)] text-white font-bold rounded-xl hover:bg-[#1a1a1a] transition-all text-sm">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Danger Zone Card ── */}
        <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-100/50">
            <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle size={18} /> Danger Zone
            </h2>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700 mt-1">Permanently delete your account and all associated data.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="shrink-0 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-sm transition-all text-sm">
              Delete Account
            </button>
          </div>
        </div>

      </div>
      
      {showDeleteModal && renderDeleteModal()}
    </div>
  );
}

export default CustomerProfile;

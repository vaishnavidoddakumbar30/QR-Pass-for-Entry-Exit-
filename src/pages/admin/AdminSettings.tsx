import React, { useState } from 'react';
import { Settings, Shield, Clock, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 600);
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">System Settings</h1>
        <p className="text-gray-400 text-sm">Configure system-wide parameters</p>
      </div>

      {[
        { icon: <Globe size={16} />, title: 'Institution', items: [
          { label: 'Institution Name', value: 'KLS Gogte Institute of Technology', type: 'text' },
          { label: 'Allowed Email Domain', value: 'Any', type: 'text' },
        ]},
        { icon: <Clock size={16} />, title: 'Pass Settings', items: [
          { label: 'Max Pass Duration (days)', value: '7', type: 'number' },
          { label: 'Daily Pass Exit From', value: '06:00', type: 'time' },
          { label: 'Daily Pass Exit Until (Curfew)', value: '21:00', type: 'time' },
          { label: 'Late Entry Grace Period (minutes)', value: '15', type: 'number' },
        ]},
        { icon: <Bell size={16} />, title: 'Notifications', items: [
          { label: 'Parent Notifications', value: 'enabled', type: 'toggle' },
          { label: 'Late Entry Alerts', value: 'enabled', type: 'toggle' },
          { label: 'Emergency Alerts', value: 'enabled', type: 'toggle' },
        ]},
      ].map(section => (
        <div key={section.title} className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-[#082b63]">{section.icon}</span>
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <label className="text-sm text-gray-600 flex-1">{item.label}</label>
                {item.type === 'toggle' ? (
                  <div className="w-11 h-6 bg-[#22a447] rounded-full relative cursor-pointer flex-shrink-0">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                ) : (
                  <input
                    type={item.type}
                    defaultValue={item.value}
                    className="w-48 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 text-right"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#082b63] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b326f] transition-colors disabled:opacity-70 flex justify-center items-center"
      >
        {isSaving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default AdminSettings;

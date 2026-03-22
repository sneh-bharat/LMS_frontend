// app/diagnostic/doctors/page.tsx — Doctor List
'use client';
import { useState } from 'react';

const doctors = [
  { id: 1, name: 'Aruna', qualification: 'MBBS', address: 'Hyderabad', mobile: '0000000000', pin: 'IIRIKD', marketing: '' },
  { id: 2, name: 'DR AMAR', qualification: 'MBBS, MD', address: 'ERRAGADDA', mobile: '9948077443', pin: 'VILA0A', marketing: '' },
  { id: 3, name: 'Dr B.C Mazumdar', qualification: 'MBBS, MS', address: 'Ranaghat', mobile: '9999999999', pin: 'GCJ0NK', marketing: '' },
];

type Doctor = typeof doctors[0];

export default function DoctorsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchBy, setSearchBy] = useState('Name');
  const [searchText, setSearchText] = useState('');
  const [marketing, setMarketing] = useState('Select Marketing');
  const [point, setPoint] = useState('Point - Yes');
  const [status, setStatus] = useState('Active');

  const openEdit = (doc: Doctor) => {
    setEditingDoctor({ ...doc });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingDoctor({ id: 0, name: '', qualification: '', address: '', mobile: '', pin: '', marketing: '' });
    setShowModal(true);
  };

  const isEdit = editingDoctor && editingDoctor.id !== 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header Bar */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '12px 20px',
        border: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#333', flex: 1 }}>
          👨‍⚕️ Doctor list
        </span>
        <a href="#" style={{ color: '#1e88e5', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
          ⚙ Point Configuration
        </a>
        <button
          onClick={openAdd}
          style={{
            background: '#1e88e5',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '7px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          + New Doctor
        </button>
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}
        >
          <option>Name</option>
          <option>Mobile</option>
        </select>
        <input
          type="text"
          placeholder="Type here..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 12px', fontSize: 13, width: 160 }}
        />
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '10px 20px',
        border: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
      }}>
        <select value={marketing} onChange={(e) => setMarketing(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}>
          <option>Select Marketing</option>
          <option>Associate A</option>
          <option>Associate B</option>
        </select>
        <select value={point} onChange={(e) => setPoint(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}>
          <option>Point - Yes</option>
          <option>Point - No</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          style={{ border: '1px solid #ddd', borderRadius: 4, padding: '6px 10px', fontSize: 13 }}>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
              {['#', 'Name, Qualification & Address', 'Mobile No', 'Login PIN', 'Marketing', 'Action'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: h === '#' || h === 'Action' ? 'center' : 'left', fontWeight: 600, color: '#444', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors
              .filter((d) => !searchText || d.name.toLowerCase().includes(searchText.toLowerCase()))
              .map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#888' }}>{doc.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, color: '#333' }}>{doc.name}</span>
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 6 }}>{doc.qualification}</span>
                    <br />
                    <span style={{ color: '#888', fontSize: 12 }}>{doc.address}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{doc.mobile}</td>
                  <td style={{ padding: '12px 16px', color: '#555', fontFamily: 'monospace' }}>{doc.pin}</td>
                  <td style={{ padding: '12px 16px', color: '#888' }}>{doc.marketing || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => openEdit(doc)}
                      style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', marginRight: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                      Point ⚙
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Load More */}
        <button style={{
          width: '100%',
          background: '#666',
          color: '#fff',
          border: 'none',
          padding: '12px',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
        }}>
          Load More
        </button>
      </div>

      {/* Modal */}
      {showModal && editingDoctor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: '24px', width: 500,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {isEdit ? 'Update Doctor Information' : 'Add New Doctor'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
                <input defaultValue={editingDoctor.name} style={inputStyle} placeholder="Doctor name" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Mobile</label>
                <input defaultValue={editingDoctor.mobile} style={inputStyle} placeholder="Mobile number" />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Qualification</label>
              <input defaultValue={editingDoctor.qualification} style={{ ...inputStyle, width: '100%' }} placeholder="e.g. MBBS, MD" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Address</label>
              <input defaultValue={editingDoctor.address} style={{ ...inputStyle, width: '100%' }} placeholder="Address" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Marketing Associate', placeholder: 'Select Associate' },
                { label: 'Point', placeholder: 'Active' },
                { label: 'Status', placeholder: 'Active' },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <select style={{ ...inputStyle, width: '100%' }}>
                    <option>{f.placeholder}</option>
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Login PIN ⚙</label>
                <input defaultValue={editingDoctor.pin} style={inputStyle} placeholder="PIN" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>EMR Template</label>
                <select style={{ ...inputStyle, width: '100%' }}><option>—</option></select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: '#9e9e9e', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                style={{ background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}
              >
                {isEdit ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 4,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};
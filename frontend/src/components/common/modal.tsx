import React from 'react';
import './modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, isDarkMode, onToggleDarkMode }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <h2>설정</h2>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-content">
          {children || (
            <div className="settings-section">
              {onToggleDarkMode && (
                <div className="settings-item">
                  <div className="settings-item-left">
                    <div className="settings-item-title">다크 모드</div>
                    <div className="settings-item-description">어두운 테마로 전환합니다</div>
                  </div>
                  <div 
                    className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                    onClick={onToggleDarkMode}
                  >
                    <div className="toggle-slider"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
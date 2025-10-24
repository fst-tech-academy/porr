import React, { useState, useRef, useEffect } from 'react';
import { Lease } from '../types';
import apiService from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  PenTool, 
  Check, 
  X, 
  Download, 
  FileText,
  User,
  Building,
  Shield,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DigitalSignatureModalProps {
  lease: Lease | null;
  isOpen: boolean;
  onClose: () => void;
  onSignatureComplete: () => void;
}

const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  lease,
  isOpen,
  onClose,
  onSignatureComplete
}) => {
  const [activeSignature, setActiveSignature] = useState<'tenant' | 'landlord' | 'guarantor' | 'broker' | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [signerName, setSignerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLease, setCurrentLease] = useState<Lease | null>(lease);

  // Update currentLease when lease prop changes
  useEffect(() => {
    setCurrentLease(lease);
  }, [lease]);

  // Refresh data when success message is set (after successful signature)
  useEffect(() => {
    if (successMessage) {
      // Delay the refresh slightly to ensure the success message is visible
      const timer = setTimeout(() => {
        onSignatureComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onSignatureComplete]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSignatureStatus = (signature: any) => {
    if (signature?.signed) {
      return { status: 'signed', color: 'text-green-600', icon: <Check className="h-4 w-4" /> };
    }
    return { status: 'unsigned', color: 'text-red-600', icon: <X className="h-4 w-4" /> };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Automatically save signature when user stops drawing
    saveSignature();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureData('');
    setSuccessMessage('');
    setError('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    setSignatureData(dataURL);
  };

  const handleSignatureSubmit = async () => {
    if (!currentLease || !activeSignature) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const signaturePayload: any = {
        signatureType: activeSignature,
        signatureUrl: signatureData,
        signerName: (activeSignature === 'guarantor' || activeSignature === 'broker') ? signerName : undefined,
      };

      await apiService.signLease(currentLease._id, signaturePayload);
      
      // Update the signature status immediately in the modal
      if (currentLease && activeSignature) {
        const updatedLease = { ...currentLease };
        if (!updatedLease.digitalSignature) {
          updatedLease.digitalSignature = {
            tenantSignature: { signed: false },
            landlordSignature: { signed: false },
            witnessSignature: { signed: false }
          } as any;
        }
        
        // Update the specific signature status
        switch (activeSignature) {
          case 'tenant':
            updatedLease.digitalSignature.tenantSignature = {
              ...updatedLease.digitalSignature.tenantSignature,
              signed: true,
              signedAt: new Date().toISOString(),
              signatureUrl: signatureData
            };
            break;
          case 'landlord':
            updatedLease.digitalSignature.landlordSignature = {
              ...updatedLease.digitalSignature.landlordSignature,
              signed: true,
              signedAt: new Date().toISOString(),
              signatureUrl: signatureData
            };
            break;
          case 'guarantor':
            updatedLease.digitalSignature.guarantorSignature = {
              ...updatedLease.digitalSignature.guarantorSignature,
              signed: true,
              signedAt: new Date().toISOString(),
              signatureUrl: signatureData,
              signerName: signerName
            };
            break;
          case 'broker':
            updatedLease.digitalSignature.brokerSignature = {
              ...updatedLease.digitalSignature.brokerSignature,
              signed: true,
              signedAt: new Date().toISOString(),
              signatureUrl: signatureData,
              signerName: signerName
            };
            break;
        }
        
        setCurrentLease(updatedLease);
      }
      
      // Show success message
      setSuccessMessage('Successfully stored signature');
      
      // Clear the signature form
      setActiveSignature(null);
      clearSignature();
      setSignerName('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit signature');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!currentLease) return;

    try {
      // Generate and download the document directly
      const response = await apiService.downloadLeaseDocument(currentLease._id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lease-${currentLease.leaseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate document');
    }
  };

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, activeSignature]);

  if (!currentLease) return null;

  // Provide default values if digitalSignature is undefined
  const digitalSignature = currentLease?.digitalSignature || {
    tenantSignature: { signed: false },
    landlordSignature: { signed: false },
    guarantorSignature: { signed: false },
    brokerSignature: { signed: false },
    witnessSignature: { signed: false }
  };

  const tenantStatus = getSignatureStatus(digitalSignature.tenantSignature);
  const landlordStatus = getSignatureStatus(digitalSignature.landlordSignature);
  const guarantorStatus = getSignatureStatus(digitalSignature.guarantorSignature);
  const brokerStatus = getSignatureStatus(digitalSignature.brokerSignature);

  const isFullySigned = digitalSignature.tenantSignature?.signed && 
                       digitalSignature.landlordSignature?.signed && 
                       digitalSignature.guarantorSignature?.signed &&
                       digitalSignature.brokerSignature?.signed;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only close when explicitly set to false (user clicked close button or ESC)
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black dark:bg-slate-800 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <PenTool className="h-5 w-5" />
            Digital Signatures - Lease {currentLease?.leaseId}
          </DialogTitle>
          <DialogDescription className="text-gray-900 dark:text-white">
            Manage digital signatures for this lease agreement. All parties must sign before the lease becomes legally binding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* All Signatures Completed Banner */}
          {isFullySigned && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Check className="h-5 w-5" />
                <span className="font-medium">Lease Fully Executed</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All parties have signed this lease agreement. The document is now legally binding.
              </p>
            </div>
          )}

          {/* Signature Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${tenantStatus.status === 'signed' ? 'border-green-500 dark:border-green-600' : 'border-red-300 dark:border-red-700'} bg-white dark:bg-slate-800`} onClick={() => { setActiveSignature('tenant'); setSuccessMessage(''); setError(''); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-900 dark:text-blue-400" />
                    <h3 className="font-semibold text-black dark:text-white">Tenant</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {tenantStatus.icon}
                    <Badge 
                      variant={tenantStatus.status === 'signed' ? 'default' : 'destructive'}
                      className={tenantStatus.status === 'signed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                    >
                      {tenantStatus.status === 'signed' ? 'Signed' : 'Not Signed'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Digital signature for tenant</p>
                {digitalSignature.tenantSignature?.signed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Signed on: {formatDate(digitalSignature.tenantSignature.signedAt!)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${landlordStatus.status === 'signed' ? 'border-green-500 dark:border-green-600' : 'border-red-300 dark:border-red-700'} bg-white dark:bg-slate-800`} onClick={() => { setActiveSignature('landlord'); setSuccessMessage(''); setError(''); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="h-6 w-6 text-green-500 dark:text-green-400" />
                    <h3 className="font-semibold text-black dark:text-white">Landlord</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {landlordStatus.icon}
                    <Badge 
                      variant={landlordStatus.status === 'signed' ? 'default' : 'destructive'}
                      className={landlordStatus.status === 'signed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                    >
                      {landlordStatus.status === 'signed' ? 'Signed' : 'Not Signed'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Digital signature for landlord</p>
                {digitalSignature.landlordSignature?.signed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Signed on: {formatDate(digitalSignature.landlordSignature.signedAt!)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${guarantorStatus.status === 'signed' ? 'border-green-500 dark:border-green-600' : 'border-red-300 dark:border-red-700'} bg-white dark:bg-slate-800`} onClick={() => { setActiveSignature('guarantor'); setSuccessMessage(''); setError(''); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                    <h3 className="font-semibold text-black dark:text-white">Guarantor</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {guarantorStatus.icon}
                    <Badge 
                      variant={guarantorStatus.status === 'signed' ? 'default' : 'destructive'}
                      className={guarantorStatus.status === 'signed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                    >
                      {guarantorStatus.status === 'signed' ? 'Signed' : 'Not Signed'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Digital signature for guarantor</p>
                {digitalSignature.guarantorSignature?.signed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Signed on: {formatDate(digitalSignature.guarantorSignature.signedAt!)}
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${brokerStatus.status === 'signed' ? 'border-green-500 dark:border-green-600' : 'border-red-300 dark:border-red-700'} bg-white dark:bg-slate-800`} onClick={() => { setActiveSignature('broker'); setSuccessMessage(''); setError(''); }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                    <h3 className="font-semibold text-black dark:text-white">Broker</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {brokerStatus.icon}
                    <Badge 
                      variant={brokerStatus.status === 'signed' ? 'default' : 'destructive'}
                      className={brokerStatus.status === 'signed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}
                    >
                      {brokerStatus.status === 'signed' ? 'Signed' : 'Not Signed'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Digital signature for broker</p>
                {digitalSignature.brokerSignature?.signed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Signed on: {formatDate(digitalSignature.brokerSignature.signedAt!)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Signature Canvas */}
          {activeSignature && (
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4 text-black dark:text-white">
                  Sign as {activeSignature === 'tenant' ? 'Tenant' : activeSignature === 'landlord' ? 'Landlord' : activeSignature === 'guarantor' ? 'Guarantor' : 'Broker'}
                </h3>
                
                {(activeSignature === 'guarantor' || activeSignature === 'broker') && (
                  <div className="mb-4">
                    <Label htmlFor="signerName" className="text-black dark:text-white">{activeSignature === 'guarantor' ? 'Guarantor' : 'Broker'} Name</Label>
                    <Input
                      id="signerName"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder={`Enter ${activeSignature} full name`}
                      className="mt-1 bg-white text-black border-gray-200 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                    />
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Draw your signature in the box below using your mouse or touchpad
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-3 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className="cursor-crosshair block"
                        style={{ width: '300px', height: '300px' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                          });
                          startDrawing(mouseEvent as any);
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          const mouseEvent = new MouseEvent('mousemove', {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                          });
                          draw(mouseEvent as any);
                        }}
                        onTouchEnd={() => stopDrawing()}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={clearSignature} className="bg-white dark:bg-slate-800 text-black dark:text-white">
                      Clear
                    </Button>
                    {signatureData && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="h-4 w-4" />
                        Signature ready
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveSignature(null)} className="bg-white dark:bg-slate-800 text-black dark:text-white">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSignatureSubmit}
                      disabled={loading || !signatureData || ((activeSignature === 'guarantor' || activeSignature === 'broker') && !signerName)}
                    >
                      {loading ? 'Submitting...' : 'Submit Signature'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Actions */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4 flex items-center gap-2 text-black dark:text-white">
                <FileText className="h-5 w-5" />
                Document Actions
              </h3>
              
              <div className="flex gap-4">
                <Button onClick={handleDownloadDocument} variant="outline" className="bg-white dark:bg-slate-800 text-black dark:text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
                
                {isFullySigned && (
                  <Button onClick={() => {/* Download final signed document */}}>
                    <FileText className="h-4 w-4 mr-2" />
                    Download Signed Lease
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <Check className="h-4 w-4" />
              {successMessage}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DigitalSignatureModal;

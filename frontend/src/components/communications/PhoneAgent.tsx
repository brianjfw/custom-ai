import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button, 
  Switch,
  Badge,
  Progress,
  Divider,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  PhoneIcon, 
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { createPhoneAgent, PhoneAgent, PhoneCall, CallMetrics, phoneAgentUtils } from '../../ai/phone-agent';
import { callRouter, CallRoute } from '../../lib/communications/call-router';

interface PhoneAgentComponentProps {
  businessId: string;
  className?: string;
}

interface PhoneAgentState {
  isActive: boolean;
  currentCalls: PhoneCall[];
  callHistory: PhoneCall[];
  metrics: CallMetrics;
  routes: CallRoute[];
  isLoading: boolean;
  error: string | null;
}

export default function PhoneAgentComponent({ businessId, className = '' }: PhoneAgentComponentProps) {
  const [phoneAgent, setPhoneAgent] = useState<PhoneAgent | null>(null);
  const [state, setState] = useState<PhoneAgentState>({
    isActive: false,
    currentCalls: [],
    callHistory: [],
    metrics: {
      totalCalls: 0,
      answeredCalls: 0,
      missedCalls: 0,
      averageCallDuration: 0,
      averageResponseTime: 0,
      appointmentsBooked: 0,
      leadsCaptured: 0,
      escalationRate: 0
    },
    routes: [],
    isLoading: true,
    error: null
  });

  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();
  const { isOpen: isCallDetailsOpen, onOpen: onCallDetailsOpen, onClose: onCallDetailsClose } = useDisclosure();
  const [selectedCall, setSelectedCall] = useState<PhoneCall | null>(null);

  // Initialize phone agent
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Create phone agent
        const agent = createPhoneAgent({
          businessId,
          welcomeMessage: "Hello! Thank you for calling. I'm your AI assistant, and I'm here to help you 24/7. How can I assist you today?",
          maxCallDuration: 30,
          enableRecording: true,
          autoTranscription: true,
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          language: 'en-US',
          emergencyKeywords: ['emergency', 'urgent', 'help', 'broken', 'leak', 'fire'],
          transferConditions: {
            maxFailedAttempts: 3,
            escalationKeywords: ['manager', 'supervisor', 'human', 'person'],
            humanRequestKeywords: ['speak to someone', 'talk to a person', 'human agent']
          }
        });

        setPhoneAgent(agent);

        // Register default route
        await callRouter.registerRoute({
          name: 'Default AI Agent',
          pattern: '.*', // Match all calls
          priority: 1,
          businessId,
          phoneAgentConfig: {},
          isDefault: true
        });

        // Update state
        setState(prev => ({
          ...prev,
          isLoading: false,
          metrics: agent.getMetrics(),
          currentCalls: agent.getActiveCalls(),
          callHistory: agent.getCallHistory(),
          routes: callRouter.getAllRoutes()
        }));
      } catch (error) {
        console.error('Failed to initialize phone agent:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize phone agent'
        }));
      }
    };

    initializeAgent();
  }, [businessId]);

  // Poll for updates
  useEffect(() => {
    if (!phoneAgent) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        metrics: phoneAgent.getMetrics(),
        currentCalls: phoneAgent.getActiveCalls(),
        callHistory: phoneAgent.getCallHistory()
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [phoneAgent]);

  const handleToggleAgent = () => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleViewCallDetails = (call: PhoneCall) => {
    setSelectedCall(call);
    onCallDetailsOpen();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'incoming': return 'warning';
      case 'transferred': return 'primary';
      case 'completed': return 'default';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  if (state.isLoading) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardBody className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-default-600">Initializing AI Phone Agent...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardBody className="p-6">
          <div className="text-center text-red-500">
            <p className="mb-4">{state.error}</p>
            <Button 
              color="primary" 
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const analysisData = phoneAgentUtils.analyzeCallMetrics(state.metrics);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-100 to-secondary-100">
              <PhoneIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Phone Agent</h2>
              <p className="text-sm text-default-600">24/7 intelligent call handling</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge 
              color={state.isActive ? 'success' : 'default'} 
              variant="dot"
              className="px-3"
            >
              {state.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              isSelected={state.isActive}
              onValueChange={handleToggleAgent}
              color="success"
              size="sm"
            />
            <Button
              variant="light"
              isIconOnly
              onClick={onConfigOpen}
            >
              <CogIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Total Calls</p>
                <p className="text-2xl font-bold text-foreground">{state.metrics.totalCalls}</p>
              </div>
              <PhoneArrowDownLeftIcon className="h-8 w-8 text-primary" />
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Answer Rate</p>
                <p className="text-2xl font-bold text-foreground">{analysisData.answerRate}</p>
              </div>
              <PhoneArrowUpRightIcon className="h-8 w-8 text-success" />
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Appointments</p>
                <p className="text-2xl font-bold text-foreground">{state.metrics.appointmentsBooked}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-warning" />
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-600">Performance</p>
                <p className="text-lg font-semibold text-foreground">{analysisData.performance}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-secondary" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Current Calls & Call History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Calls */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-foreground">Active Calls</h3>
              <Badge color="primary" variant="flat">
                {state.currentCalls.length}
              </Badge>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="max-h-80 overflow-y-auto">
            {state.currentCalls.length === 0 ? (
              <div className="text-center py-8 text-default-600">
                <PhoneIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active calls</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.currentCalls.map((call) => (
                  <div
                    key={call.callId}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-100 hover:bg-default-200 transition-colors cursor-pointer"
                    onClick={() => handleViewCallDetails(call)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge color={getStatusColor(call.status)} variant="dot" />
                      <div>
                        <p className="font-medium text-sm">{call.callerName || call.callerId || 'Unknown'}</p>
                        <p className="text-xs text-default-600">
                          {new Date(call.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-600 capitalize">{call.status}</p>
                      {call.duration && (
                        <p className="text-xs text-default-500">{formatDuration(call.duration)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Call History */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-foreground">Recent Calls</h3>
              <Badge color="default" variant="flat">
                {state.callHistory.length}
              </Badge>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="max-h-80 overflow-y-auto">
            {state.callHistory.length === 0 ? (
              <div className="text-center py-8 text-default-600">
                <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No call history</p>
              </div>
            ) : (
              <div className="space-y-3">
                {state.callHistory.slice(0, 10).map((call) => (
                  <div
                    key={call.callId}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors cursor-pointer"
                    onClick={() => handleViewCallDetails(call)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge color={getStatusColor(call.status)} variant="dot" />
                      <div>
                        <p className="font-medium text-sm">{call.callerName || call.callerId || 'Unknown'}</p>
                        <p className="text-xs text-default-600">
                          {new Date(call.startTime).toLocaleDateString()} at {new Date(call.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-600 capitalize">{call.status}</p>
                      {call.duration && (
                        <p className="text-xs text-default-500">{formatDuration(call.duration)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card className="glass-card">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Performance Overview</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-default-600">Answer Rate</span>
                <span className="text-sm font-medium">{analysisData.answerRate}</span>
              </div>
              <Progress 
                value={parseFloat(analysisData.answerRate)} 
                color="success" 
                size="sm"
                className="mb-4"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-default-600">Conversion Rate</span>
                <span className="text-sm font-medium">{analysisData.conversionRate}</span>
              </div>
              <Progress 
                value={parseFloat(analysisData.conversionRate)} 
                color="primary" 
                size="sm"
                className="mb-4"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-default-600">Escalation Rate</span>
                <span className="text-sm font-medium">{analysisData.escalationRate}</span>
              </div>
              <Progress 
                value={parseFloat(analysisData.escalationRate)} 
                color="warning" 
                size="sm"
                className="mb-4"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{state.metrics.leadsCaptured}</p>
              <p className="text-sm text-default-600">Leads Captured</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{analysisData.averageCallDuration}</p>
              <p className="text-sm text-default-600">Avg Call Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{state.metrics.appointmentsBooked}</p>
              <p className="text-sm text-default-600">Appointments Booked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{analysisData.performance}</p>
              <p className="text-sm text-default-600">Overall Performance</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Call Details Modal */}
      <Modal 
        isOpen={isCallDetailsOpen} 
        onClose={onCallDetailsClose}
        size="2xl"
        classNames={{
          base: "glass-modal",
          content: "glass-card"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Call Details</h3>
                <p className="text-sm text-default-600">
                  {selectedCall?.callerName || selectedCall?.callerId || 'Unknown Caller'}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedCall && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-default-700">Call ID</label>
                    <p className="text-sm text-default-600">{selectedCall.callId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Status</label>
                    <Badge color={getStatusColor(selectedCall.status)} variant="flat" className="ml-2">
                      {selectedCall.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Start Time</label>
                    <p className="text-sm text-default-600">
                      {new Date(selectedCall.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-700">Duration</label>
                    <p className="text-sm text-default-600">
                      {selectedCall.duration ? formatDuration(selectedCall.duration) : 'Ongoing'}
                    </p>
                  </div>
                </div>
                
                {selectedCall.summary && (
                  <div>
                    <label className="text-sm font-medium text-default-700">Summary</label>
                    <p className="text-sm text-default-600 mt-1">{selectedCall.summary}</p>
                  </div>
                )}
                
                {selectedCall.escalationReason && (
                  <div>
                    <label className="text-sm font-medium text-default-700">Escalation Reason</label>
                    <p className="text-sm text-default-600 mt-1">{selectedCall.escalationReason}</p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCallDetailsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Configuration Modal */}
      <Modal 
        isOpen={isConfigOpen} 
        onClose={onConfigClose}
        size="lg"
        classNames={{
          base: "glass-modal",
          content: "glass-card"
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center space-x-3">
              <CogIcon className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Phone Agent Configuration</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="text-center py-8">
              <p className="text-default-600">Configuration panel coming soon...</p>
              <p className="text-sm text-default-500 mt-2">
                Advanced settings for voice, routing, and AI behavior will be available here.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onConfigClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
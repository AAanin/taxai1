import React, { useState, useEffect } from 'react';
import { Download, Upload, HardDrive, RefreshCw, Archive, Trash2, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, Database, Shield, FileText, Settings, Copy, RotateCcw, Save, FolderOpen, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface BackupItem {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'configuration' | 'data';
  size: number;
  createdAt: string;
  agentIds: string[];
  status: 'completed' | 'in_progress' | 'failed' | 'corrupted';
  description?: string;
  checksum: string;
  compression: 'none' | 'gzip' | 'bzip2';
  encryption: boolean;
  retentionDays: number;
  metadata: {
    version: string;
    agentCount: number;
    configCount: number;
    dataSize: number;
    creator: string;
  };
}

interface RecoveryOperation {
  id: string;
  backupId: string;
  type: 'full' | 'selective' | 'configuration' | 'data';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  selectedAgents?: string[];
  options: {
    overwriteExisting: boolean;
    preserveIds: boolean;
    validateIntegrity: boolean;
    createBackupBeforeRestore: boolean;
  };
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

interface ScheduledBackup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'configuration';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  agentIds: string[];
  enabled: boolean;
  retentionDays: number;
  compression: 'none' | 'gzip' | 'bzip2';
  encryption: boolean;
  lastRun?: string;
  nextRun: string;
  successCount: number;
  failureCount: number;
}

interface AIAgentBackupRecoveryProps {
  language: 'en' | 'bn';
}

const AIAgentBackupRecovery: React.FC<AIAgentBackupRecoveryProps> = ({ language }) => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [recoveryOperations, setRecoveryOperations] = useState<RecoveryOperation[]>([]);
  const [scheduledBackups, setScheduledBackups] = useState<ScheduledBackup[]>([]);
  const [activeTab, setActiveTab] = useState<'backups' | 'recovery' | 'scheduled'>('backups');
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'full' | 'incremental' | 'configuration' | 'data'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<string | null>(null);
  
  const [backupForm, setBackupForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental' | 'configuration' | 'data',
    description: '',
    agentIds: [] as string[],
    compression: 'gzip' as 'none' | 'gzip' | 'bzip2',
    encryption: true,
    retentionDays: 30
  });
  
  const [restoreForm, setRestoreForm] = useState({
    type: 'full' as 'full' | 'selective' | 'configuration' | 'data',
    selectedAgents: [] as string[],
    overwriteExisting: false,
    preserveIds: true,
    validateIntegrity: true,
    createBackupBeforeRestore: true
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'full' as 'full' | 'incremental' | 'configuration',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    agentIds: [] as string[],
    retentionDays: 30,
    compression: 'gzip' as 'none' | 'gzip' | 'bzip2',
    encryption: true
  });

  const translations = {
    en: {
      title: 'AI Agent Backup & Recovery',
      backups: 'Backups',
      recovery: 'Recovery',
      scheduled: 'Scheduled Backups',
      createBackup: 'Create Backup',
      restoreBackup: 'Restore Backup',
      scheduleBackup: 'Schedule Backup',
      backupName: 'Backup Name',
      backupType: 'Backup Type',
      description: 'Description',
      agents: 'Agents',
      compression: 'Compression',
      encryption: 'Encryption',
      retentionDays: 'Retention (Days)',
      size: 'Size',
      createdAt: 'Created At',
      status: 'Status',
      actions: 'Actions',
      full: 'Full',
      incremental: 'Incremental',
      configuration: 'Configuration',
      data: 'Data',
      completed: 'Completed',
      inProgress: 'In Progress',
      failed: 'Failed',
      corrupted: 'Corrupted',
      pending: 'Pending',
      none: 'None',
      gzip: 'GZip',
      bzip2: 'BZip2',
      enabled: 'Enabled',
      disabled: 'Disabled',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      download: 'Download',
      restore: 'Restore',
      delete: 'Delete',
      verify: 'Verify',
      duplicate: 'Duplicate',
      details: 'Details',
      search: 'Search backups...',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      deleteSelected: 'Delete Selected',
      downloadSelected: 'Download Selected',
      backupsSelected: 'backups selected',
      noBackups: 'No backups found',
      noRecoveryOperations: 'No recovery operations',
      noScheduledBackups: 'No scheduled backups',
      restoreType: 'Restore Type',
      selective: 'Selective',
      selectedAgents: 'Selected Agents',
      restoreOptions: 'Restore Options',
      overwriteExisting: 'Overwrite Existing',
      preserveIds: 'Preserve IDs',
      validateIntegrity: 'Validate Integrity',
      createBackupBeforeRestore: 'Create Backup Before Restore',
      frequency: 'Frequency',
      time: 'Time',
      dayOfWeek: 'Day of Week',
      dayOfMonth: 'Day of Month',
      lastRun: 'Last Run',
      nextRun: 'Next Run',
      successCount: 'Success Count',
      failureCount: 'Failure Count',
      enable: 'Enable',
      disable: 'Disable',
      edit: 'Edit',
      run: 'Run Now',
      logs: 'Logs',
      progress: 'Progress',
      startedAt: 'Started At',
      completedAt: 'Completed At',
      cancel: 'Cancel',
      save: 'Save',
      create: 'Create',
      schedule: 'Schedule',
      close: 'Close',
      confirm: 'Confirm',
      warning: 'Warning',
      error: 'Error',
      info: 'Info',
      success: 'Success',
      confirmDelete: 'Are you sure you want to delete this backup?',
      confirmDeleteSelected: 'Are you sure you want to delete selected backups?',
      confirmRestore: 'Are you sure you want to restore this backup?',
      backupCreated: 'Backup created successfully',
      backupFailed: 'Backup creation failed',
      restoreStarted: 'Restore operation started',
      restoreFailed: 'Restore operation failed',
      scheduleCreated: 'Scheduled backup created',
      scheduleFailed: 'Failed to create scheduled backup',
      invalidForm: 'Please fill in all required fields',
      storageUsage: 'Storage Usage',
      totalBackups: 'Total Backups',
      totalSize: 'Total Size',
      lastBackup: 'Last Backup',
      systemHealth: 'System Health',
      healthy: 'Healthy',
      degraded: 'Degraded',
      critical: 'Critical',
      exportSettings: 'Export Settings',
      importSettings: 'Import Settings',
      clearHistory: 'Clear History',
      refreshData: 'Refresh Data',
      autoRefresh: 'Auto Refresh',
      mb: 'MB',
      gb: 'GB',
      tb: 'TB',
      bytes: 'bytes',
      ago: 'ago',
      never: 'Never',
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    },
    bn: {
      title: 'AI এজেন্ট ব্যাকআপ ও রিকভারি',
      backups: 'ব্যাকআপ',
      recovery: 'রিকভারি',
      scheduled: 'নির্ধারিত ব্যাকআপ',
      createBackup: 'ব্যাকআপ তৈরি',
      restoreBackup: 'ব্যাকআপ পুনরুদ্ধার',
      scheduleBackup: 'ব্যাকআপ নির্ধারণ',
      backupName: 'ব্যাকআপের নাম',
      backupType: 'ব্যাকআপের ধরন',
      description: 'বিবরণ',
      agents: 'এজেন্ট',
      compression: 'কম্প্রেশন',
      encryption: 'এনক্রিপশন',
      retentionDays: 'সংরক্ষণ (দিন)',
      size: 'আকার',
      createdAt: 'তৈরির তারিখ',
      status: 'অবস্থা',
      actions: 'কার্যক্রম',
      full: 'সম্পূর্ণ',
      incremental: 'ক্রমবর্ধমান',
      configuration: 'কনফিগারেশন',
      data: 'ডেটা',
      completed: 'সম্পন্ন',
      inProgress: 'চলমান',
      failed: 'ব্যর্থ',
      corrupted: 'দূষিত',
      pending: 'অপেক্ষমান',
      none: 'কোনটি নয়',
      gzip: 'জিজিপ',
      bzip2: 'বিজিপ২',
      enabled: 'সক্রিয়',
      disabled: 'নিষ্ক্রিয়',
      daily: 'দৈনিক',
      weekly: 'সাপ্তাহিক',
      monthly: 'মাসিক',
      download: 'ডাউনলোড',
      restore: 'পুনরুদ্ধার',
      delete: 'মুছুন',
      verify: 'যাচাই',
      duplicate: 'অনুলিপি',
      details: 'বিস্তারিত',
      search: 'ব্যাকআপ খুঁজুন...',
      filter: 'ফিল্টার',
      sort: 'সাজান',
      all: 'সব',
      selectAll: 'সব নির্বাচন',
      deselectAll: 'নির্বাচন বাতিল',
      deleteSelected: 'নির্বাচিত মুছুন',
      downloadSelected: 'নির্বাচিত ডাউনলোড',
      backupsSelected: 'ব্যাকআপ নির্বাচিত',
      noBackups: 'কোন ব্যাকআপ পাওয়া যায়নি',
      noRecoveryOperations: 'কোন রিকভারি অপারেশন নেই',
      noScheduledBackups: 'কোন নির্ধারিত ব্যাকআপ নেই',
      restoreType: 'পুনরুদ্ধারের ধরন',
      selective: 'নির্বাচনী',
      selectedAgents: 'নির্বাচিত এজেন্ট',
      restoreOptions: 'পুনরুদ্ধার অপশন',
      overwriteExisting: 'বিদ্যমান প্রতিস্থাপন',
      preserveIds: 'আইডি সংরক্ষণ',
      validateIntegrity: 'অখণ্ডতা যাচাই',
      createBackupBeforeRestore: 'পুনরুদ্ধারের আগে ব্যাকআপ তৈরি',
      frequency: 'ফ্রিকোয়েন্সি',
      time: 'সময়',
      dayOfWeek: 'সপ্তাহের দিন',
      dayOfMonth: 'মাসের দিন',
      lastRun: 'শেষ চালনা',
      nextRun: 'পরবর্তী চালনা',
      successCount: 'সফল সংখ্যা',
      failureCount: 'ব্যর্থ সংখ্যা',
      enable: 'সক্রিয়',
      disable: 'নিষ্ক্রিয়',
      edit: 'সম্পাদনা',
      run: 'এখনই চালান',
      logs: 'লগ',
      progress: 'অগ্রগতি',
      startedAt: 'শুরুর সময়',
      completedAt: 'সমাপ্তির সময়',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ',
      create: 'তৈরি',
      schedule: 'নির্ধারণ',
      close: 'বন্ধ',
      confirm: 'নিশ্চিত',
      warning: 'সতর্কতা',
      error: 'ত্রুটি',
      info: 'তথ্য',
      success: 'সফল',
      confirmDelete: 'আপনি কি এই ব্যাকআপ মুছতে চান?',
      confirmDeleteSelected: 'আপনি কি নির্বাচিত ব্যাকআপগুলি মুছতে চান?',
      confirmRestore: 'আপনি কি এই ব্যাকআপ পুনরুদ্ধার করতে চান?',
      backupCreated: 'ব্যাকআপ সফলভাবে তৈরি হয়েছে',
      backupFailed: 'ব্যাকআপ তৈরি ব্যর্থ হয়েছে',
      restoreStarted: 'পুনরুদ্ধার অপারেশন শুরু হয়েছে',
      restoreFailed: 'পুনরুদ্ধার অপারেশন ব্যর্থ হয়েছে',
      scheduleCreated: 'নির্ধারিত ব্যাকআপ তৈরি হয়েছে',
      scheduleFailed: 'নির্ধারিত ব্যাকআপ তৈরি ব্যর্থ হয়েছে',
      invalidForm: 'অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
      storageUsage: 'স্টোরেজ ব্যবহার',
      totalBackups: 'মোট ব্যাকআপ',
      totalSize: 'মোট আকার',
      lastBackup: 'শেষ ব্যাকআপ',
      systemHealth: 'সিস্টেম স্বাস্থ্য',
      healthy: 'সুস্থ',
      degraded: 'অবনতি',
      critical: 'গুরুতর',
      exportSettings: 'সেটিংস এক্সপোর্ট',
      importSettings: 'সেটিংস ইমপোর্ট',
      clearHistory: 'ইতিহাস পরিষ্কার',
      refreshData: 'ডেটা রিফ্রেশ',
      autoRefresh: 'অটো রিফ্রেশ',
      mb: 'MB',
      gb: 'GB',
      tb: 'TB',
      bytes: 'বাইট',
      ago: 'আগে',
      never: 'কখনো না',
      sunday: 'রবিবার',
      monday: 'সোমবার',
      tuesday: 'মঙ্গলবার',
      wednesday: 'বুধবার',
      thursday: 'বৃহস্পতিবার',
      friday: 'শুক্রবার',
      saturday: 'শনিবার'
    }
  };

  const t = translations[language];

  // Sample data
  useEffect(() => {
    const sampleBackups: BackupItem[] = [
      {
        id: '1',
        name: 'Full System Backup - Weekly',
        type: 'full',
        size: 2147483648, // 2GB
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        agentIds: ['1', '2', '3', '4'],
        status: 'completed',
        description: 'Weekly full system backup including all agents and configurations',
        checksum: 'sha256:a1b2c3d4e5f6...',
        compression: 'gzip',
        encryption: true,
        retentionDays: 90,
        metadata: {
          version: '2.1.0',
          agentCount: 4,
          configCount: 12,
          dataSize: 1073741824,
          creator: 'admin'
        }
      },
      {
        id: '2',
        name: 'Configuration Backup',
        type: 'configuration',
        size: 52428800, // 50MB
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        agentIds: ['1', '2'],
        status: 'completed',
        description: 'Configuration backup for medical agents',
        checksum: 'sha256:b2c3d4e5f6a1...',
        compression: 'bzip2',
        encryption: true,
        retentionDays: 30,
        metadata: {
          version: '2.1.0',
          agentCount: 2,
          configCount: 8,
          dataSize: 0,
          creator: 'admin'
        }
      },
      {
        id: '3',
        name: 'Emergency Backup',
        type: 'incremental',
        size: 104857600, // 100MB
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        agentIds: ['3'],
        status: 'failed',
        description: 'Emergency backup before system update',
        checksum: 'sha256:c3d4e5f6a1b2...',
        compression: 'gzip',
        encryption: false,
        retentionDays: 7,
        metadata: {
          version: '2.0.5',
          agentCount: 1,
          configCount: 3,
          dataSize: 83886080,
          creator: 'system'
        }
      }
    ];

    const sampleRecoveryOperations: RecoveryOperation[] = [
      {
        id: '1',
        backupId: '1',
        type: 'selective',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        selectedAgents: ['1', '2'],
        options: {
          overwriteExisting: true,
          preserveIds: true,
          validateIntegrity: true,
          createBackupBeforeRestore: true
        },
        logs: [
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Starting selective restore operation'
          },
          {
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Validating backup integrity'
          },
          {
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Creating backup before restore'
          },
          {
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Restoring agent configurations'
          },
          {
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            level: 'info',
            message: 'Restore operation completed successfully'
          }
        ]
      }
    ];

    const sampleScheduledBackups: ScheduledBackup[] = [
      {
        id: '1',
        name: 'Daily Configuration Backup',
        type: 'configuration',
        schedule: {
          frequency: 'daily',
          time: '02:00'
        },
        agentIds: ['1', '2', '3', '4'],
        enabled: true,
        retentionDays: 30,
        compression: 'gzip',
        encryption: true,
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        successCount: 25,
        failureCount: 2
      },
      {
        id: '2',
        name: 'Weekly Full Backup',
        type: 'full',
        schedule: {
          frequency: 'weekly',
          time: '01:00',
          dayOfWeek: 0 // Sunday
        },
        agentIds: ['1', '2', '3', '4'],
        enabled: true,
        retentionDays: 90,
        compression: 'bzip2',
        encryption: true,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        successCount: 12,
        failureCount: 0
      }
    ];

    setBackups(sampleBackups);
    setRecoveryOperations(sampleRecoveryOperations);
    setScheduledBackups(sampleScheduledBackups);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 ' + t.bytes;
    const k = 1024;
    const sizes = [t.bytes, t.mb, t.gb, t.tb];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '1m ' + t.ago;
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ' + t.ago;
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ' + t.ago;
    return Math.floor(diff / 86400000) + 'd ' + t.ago;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'corrupted': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-gray-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'corrupted': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Database className="h-4 w-4" />;
      case 'incremental': return <Archive className="h-4 w-4" />;
      case 'configuration': return <Settings className="h-4 w-4" />;
      case 'data': return <HardDrive className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || backup.type === filterType;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleCreateBackup = async () => {
    if (!backupForm.name || !backupForm.type) {
      alert(t.invalidForm);
      return;
    }
    
    setIsCreatingBackup(true);
    
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newBackup: BackupItem = {
      id: Date.now().toString(),
      name: backupForm.name,
      type: backupForm.type,
      size: Math.floor(Math.random() * 1000000000), // Random size
      createdAt: new Date().toISOString(),
      agentIds: backupForm.agentIds,
      status: 'completed',
      description: backupForm.description,
      checksum: 'sha256:' + Math.random().toString(36).substring(7),
      compression: backupForm.compression,
      encryption: backupForm.encryption,
      retentionDays: backupForm.retentionDays,
      metadata: {
        version: '2.1.0',
        agentCount: backupForm.agentIds.length,
        configCount: Math.floor(Math.random() * 20),
        dataSize: Math.floor(Math.random() * 500000000),
        creator: 'admin'
      }
    };
    
    setBackups(prev => [newBackup, ...prev]);
    setIsCreatingBackup(false);
    setShowCreateModal(false);
    setBackupForm({
      name: '',
      type: 'full',
      description: '',
      agentIds: [],
      compression: 'gzip',
      encryption: true,
      retentionDays: 30
    });
    
    alert(t.backupCreated);
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackupForRestore) return;
    
    setIsRestoring(true);
    
    // Simulate restore operation
    const newOperation: RecoveryOperation = {
      id: Date.now().toString(),
      backupId: selectedBackupForRestore,
      type: restoreForm.type,
      status: 'in_progress',
      progress: 0,
      startedAt: new Date().toISOString(),
      selectedAgents: restoreForm.selectedAgents,
      options: {
        overwriteExisting: restoreForm.overwriteExisting,
        preserveIds: restoreForm.preserveIds,
        validateIntegrity: restoreForm.validateIntegrity,
        createBackupBeforeRestore: restoreForm.createBackupBeforeRestore
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Starting restore operation'
        }
      ]
    };
    
    setRecoveryOperations(prev => [newOperation, ...prev]);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setRecoveryOperations(prev => prev.map(op => 
        op.id === newOperation.id ? { ...op, progress: i } : op
      ));
    }
    
    // Complete operation
    setRecoveryOperations(prev => prev.map(op => 
      op.id === newOperation.id ? {
        ...op,
        status: 'completed',
        completedAt: new Date().toISOString(),
        logs: [...op.logs, {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Restore operation completed successfully'
        }]
      } : op
    ));
    
    setIsRestoring(false);
    setShowRestoreModal(false);
    setSelectedBackupForRestore(null);
    setRestoreForm({
      type: 'full',
      selectedAgents: [],
      overwriteExisting: false,
      preserveIds: true,
      validateIntegrity: true,
      createBackupBeforeRestore: true
    });
    
    alert(t.restoreStarted);
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm(t.confirmDelete)) {
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedBackups.length === 0) return;
    if (confirm(t.confirmDeleteSelected)) {
      setBackups(prev => prev.filter(backup => !selectedBackups.includes(backup.id)));
      setSelectedBackups([]);
    }
  };

  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  const completedBackups = backups.filter(backup => backup.status === 'completed').length;
  const lastBackup = backups.length > 0 ? backups[0].createdAt : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Archive className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{t.createBackup}</span>
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>{t.scheduleBackup}</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalBackups}</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
            <Archive className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.totalSize}</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
            </div>
            <HardDrive className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.lastBackup}</p>
              <p className="text-lg font-bold text-gray-900">
                {lastBackup ? formatTimestamp(lastBackup) : t.never}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t.systemHealth}</p>
              <p className="text-lg font-bold text-green-600">{t.healthy}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'backups', label: t.backups, icon: Archive },
              { id: 'recovery', label: t.recovery, icon: RefreshCw },
              { id: 'scheduled', label: t.scheduled, icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t.all}</option>
                    <option value="full">{t.full}</option>
                    <option value="incremental">{t.incremental}</option>
                    <option value="configuration">{t.configuration}</option>
                    <option value="data">{t.data}</option>
                  </select>
                  
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as any);
                      setSortOrder(order as any);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="size-desc">Size (Largest)</option>
                    <option value="size-asc">Size (Smallest)</option>
                  </select>
                </div>
                
                {selectedBackups.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedBackups.length} {t.backupsSelected}
                    </span>
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{t.deleteSelected}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Backups Table */}
              {filteredBackups.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t.noBackups}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedBackups.length === filteredBackups.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBackups(filteredBackups.map(b => b.id));
                              } else {
                                setSelectedBackups([]);
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.backupName}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.backupType}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.size}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.createdAt}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.status}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBackups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedBackups.includes(backup.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBackups(prev => [...prev, backup.id]);
                                } else {
                                  setSelectedBackups(prev => prev.filter(id => id !== backup.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                              {backup.description && (
                                <div className="text-xs text-gray-500">{backup.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(backup.type)}
                              <span className="text-sm text-gray-900">{t[backup.type]}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatFileSize(backup.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTimestamp(backup.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(backup.status)}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                                {t[backup.status]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBackupForRestore(backup.id);
                                setShowRestoreModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title={t.restore}
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title={t.download}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                              title={t.duplicate}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title={t.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recovery Tab */}
          {activeTab === 'recovery' && (
            <div className="space-y-4">
              {recoveryOperations.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t.noRecoveryOperations}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recoveryOperations.map((operation) => (
                    <div key={operation.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(operation.status)}
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {t[operation.type]} {t.restore}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t.startedAt}: {formatTimestamp(operation.startedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{operation.progress}%</div>
                          <div className="text-sm text-gray-500">{t[operation.status]}</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${operation.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t.restoreOptions}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>• {t.overwriteExisting}: {operation.options.overwriteExisting ? 'Yes' : 'No'}</div>
                            <div>• {t.preserveIds}: {operation.options.preserveIds ? 'Yes' : 'No'}</div>
                            <div>• {t.validateIntegrity}: {operation.options.validateIntegrity ? 'Yes' : 'No'}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{t.logs}</h4>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {operation.logs.slice(-3).map((log, index) => (
                              <div key={index} className="text-xs text-gray-600">
                                <span className="font-mono">{formatTimestamp(log.timestamp)}</span>: {log.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scheduled Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              {scheduledBackups.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t.noScheduledBackups}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {scheduledBackups.map((schedule) => (
                    <div key={schedule.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{schedule.name}</h3>
                          <p className="text-sm text-gray-500">{t[schedule.type]} backup</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.enabled ? t.enabled : t.disabled}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t.frequency}</p>
                          <p className="text-sm text-gray-600">{t[schedule.schedule.frequency]} at {schedule.schedule.time}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t.nextRun}</p>
                          <p className="text-sm text-gray-600">{formatTimestamp(schedule.nextRun)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t.successCount}</p>
                          <p className="text-sm text-green-600">{schedule.successCount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{t.failureCount}</p>
                          <p className="text-sm text-red-600">{schedule.failureCount}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded" title={t.edit}>
                            <Settings className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 rounded" title={t.run}>
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded" title={t.delete}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            schedule.enabled
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {schedule.enabled ? t.disable : t.enable}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.createBackup}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.backupName}</label>
                <input
                  type="text"
                  value={backupForm.name}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter backup name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.backupType}</label>
                <select
                  value={backupForm.type}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full">{t.full}</option>
                  <option value="incremental">{t.incremental}</option>
                  <option value="configuration">{t.configuration}</option>
                  <option value="data">{t.data}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea
                  value={backupForm.description}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter backup description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.compression}</label>
                  <select
                    value={backupForm.compression}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, compression: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">{t.none}</option>
                    <option value="gzip">{t.gzip}</option>
                    <option value="bzip2">{t.bzip2}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.retentionDays}</label>
                  <input
                    type="number"
                    value={backupForm.retentionDays}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="encryption"
                  checked={backupForm.encryption}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, encryption: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="encryption" className="text-sm font-medium text-gray-700">{t.encryption}</label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isCreatingBackup ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isCreatingBackup ? 'Creating...' : t.create}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackupForRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.restoreBackup}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.restoreType}</label>
                <select
                  value={restoreForm.type}
                  onChange={(e) => setRestoreForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full">{t.full}</option>
                  <option value="selective">{t.selective}</option>
                  <option value="configuration">{t.configuration}</option>
                  <option value="data">{t.data}</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">{t.restoreOptions}</h4>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={restoreForm.overwriteExisting}
                    onChange={(e) => setRestoreForm(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="overwrite" className="text-sm text-gray-700">{t.overwriteExisting}</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preserveIds"
                    checked={restoreForm.preserveIds}
                    onChange={(e) => setRestoreForm(prev => ({ ...prev, preserveIds: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="preserveIds" className="text-sm text-gray-700">{t.preserveIds}</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="validate"
                    checked={restoreForm.validateIntegrity}
                    onChange={(e) => setRestoreForm(prev => ({ ...prev, validateIntegrity: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="validate" className="text-sm text-gray-700">{t.validateIntegrity}</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createBackup"
                    checked={restoreForm.createBackupBeforeRestore}
                    onChange={(e) => setRestoreForm(prev => ({ ...prev, createBackupBeforeRestore: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="createBackup" className="text-sm text-gray-700">{t.createBackupBeforeRestore}</label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackupForRestore(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={isRestoring}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isRestoring ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{isRestoring ? 'Restoring...' : t.restore}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Backup Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.scheduleBackup}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.backupName}</label>
                <input
                  type="text"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter schedule name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.backupType}</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full">{t.full}</option>
                    <option value="incremental">{t.incremental}</option>
                    <option value="configuration">{t.configuration}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.frequency}</label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">{t.daily}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="monthly">{t.monthly}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.time}</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.retentionDays}</label>
                  <input
                    type="number"
                    value={scheduleForm.retentionDays}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="365"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="scheduleEncryption"
                  checked={scheduleForm.encryption}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, encryption: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="scheduleEncryption" className="text-sm font-medium text-gray-700">{t.encryption}</label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>{t.schedule}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentBackupRecovery;
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useFirebaseMeals, useFirebaseMembers, useFirebaseHousehold } from './useFirebase';

const SAMPLE_MEMBERS = ['Alice', 'Bob', 'Sarah', 'John', 'Emma', 'Mike', 'Lisa', 'David', 'Sophie', 'Tom'];
const DIETARY_OPTIONS = ['Normal', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy'];
const DIETARY_RESTRICTIONS = { Alice: 'Vegetarian', Sarah: 'Vegetarian', Emma: 'Normal' };


function MealCell({ state, onPress, canEdit = true }) {
  const getDisplay = () => {
    switch (state) {
      case 'none':
        return { icon: '', bg: canEdit ? '#f5f5f5' : '#e8e8e8', text: '#999' };
      case 'attending':
        return { icon: '✓', bg: '#4CAF50', text: '#fff' };
      case 'attending+container':
        return { icon: '✓\n+\n🍱', bg: '#2196F3', text: '#fff' };
      default:
        return { icon: '', bg: canEdit ? '#f5f5f5' : '#e8e8e8', text: '#999' };
    }
  };

  const display = getDisplay();

  return (
    <TouchableOpacity
      style={[styles.mealButton, { backgroundColor: display.bg, opacity: canEdit ? 1 : 0.5 }]}
      onPress={onPress}
      disabled={!canEdit}
    >
      <Text style={[styles.mealButtonText, { color: display.text }]}>{display.icon}</Text>
    </TouchableOpacity>
  );
}

function SettingsScreen({ currentMember, memberDietary, isAdmin, onBack }) {
  return (
    <View style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>⚙️ Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.settingsContent}>
        {/* Profile Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{currentMember}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Account Type</Text>
            <Text style={styles.settingValue}>{isAdmin ? '👑 Admin' : '👤 Member'}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Diet Preference</Text>
            <Text style={styles.settingValue}>{memberDietary[currentMember] || 'Normal'}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>About</Text>

          <Text style={styles.infoText}>
            Feldmark | Essenplanung v1.0
          </Text>
          <Text style={styles.infoText}>
            Coordinate household meals and track dietary preferences.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>How it works:</Text>
          <Text style={styles.infoBullet}>• Tap meal cells to cycle through:</Text>
          <Text style={styles.infoBulletNested}>  ☐ Not joining the meal</Text>
          <Text style={styles.infoBulletNested}>  ✓ Joining the meal</Text>
          <Text style={styles.infoBulletNested}>  ✓+🍱 Joining meal and need additional lunch box</Text>
          <Text style={styles.infoBullet}>• Admins can manage members and view analytics</Text>
          <Text style={styles.infoBullet}>• Members can only edit their own meal entries</Text>
          <Text style={styles.infoBullet}>• Historical data is preserved for analytics</Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          <Text style={styles.infoBullet}>✓ = Joining the meal</Text>
          <Text style={styles.infoBullet}>🍱 = Need lunchbox</Text>
          <Text style={styles.infoBullet}>Diet is set when members are added</Text>
          <Text style={styles.infoBullet}>Dashboard shows monthly meal analytics</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MemberManagement({ members, memberDietary, onAddMember, onRemoveMember, onBack }) {
  const [newName, setNewName] = useState('');
  const [newDietary, setNewDietary] = useState('Normal');
  const [removingMember, setRemovingMember] = useState(null);

  const handleAddMember = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a member name');
      return;
    }
    onAddMember(newName, newDietary);
    setNewName('');
    setNewDietary('Normal');
  };

  return (
    <View style={styles.managementContainer}>
      <View style={styles.managementHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.managementTitle}>👥 Member Management</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.managementContent} scrollEventThrottle={16}>
        {/* Add Member Section */}
        <View style={styles.addMemberCard}>
          <Text style={styles.addMemberTitle}>Add New Member</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter member name"
            value={newName}
            onChangeText={setNewName}
          />

          <Text style={styles.label}>Diet</Text>
          <View style={styles.dietaryOptions}>
            {DIETARY_OPTIONS.map(diet => (
              <TouchableOpacity
                key={diet}
                style={[styles.dietaryOption, newDietary === diet && styles.dietaryOptionActive]}
                onPress={() => setNewDietary(diet)}
              >
                <Text style={[styles.dietaryOptionText, newDietary === diet && styles.dietaryOptionTextActive]}>
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Text style={styles.addButtonText}>+ Add Member</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={styles.membersListCard} pointerEvents="auto">
          <Text style={styles.membersListTitle}>Current Members ({members.length})</Text>

          {members.map(member => (
            <View key={member} style={styles.memberItem} pointerEvents="auto">
              <View style={styles.memberInfo} pointerEvents="none">
                <Text style={styles.memberName}>{member}</Text>
                {memberDietary[member] && memberDietary[member] !== 'Normal' && (
                  <Text style={styles.memberDietary}>{memberDietary[member]}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                activeOpacity={0.6}
                onPress={() => setRemovingMember(member)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Confirmation Modal */}
        {removingMember && (
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationTitle}>Remove Member?</Text>
              <Text style={styles.confirmationText}>Are you sure you want to remove {removingMember}?</Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.cancelButton]}
                  onPress={() => setRemovingMember(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.removeConfirmButton]}
                  onPress={() => {
                    onRemoveMember(removingMember);
                    setRemovingMember(null);
                  }}
                >
                  <Text style={styles.removeConfirmButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AdminDashboard({ meals, dates, onBack, members, memberDietary, historicalMembers }) {
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMealType, setFilterMealType] = useState('all'); // 'all', 'normal', 'vegetarian'
  const [filterMembers, setFilterMembers] = useState(new Set(['all'])); // Multi-select members
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Get all members (current and historical) from meal data
  const getAllMembers = () => {
    const membersSet = new Set(members);
    if (historicalMembers) {
      historicalMembers.forEach(m => membersSet.add(m));
    }
    Object.keys(meals).forEach(key => {
      // Key format: "YYYY-MM-DD-membername-lunch/dinner"
      const lastDash = key.lastIndexOf('-');
      const secondLastDash = key.lastIndexOf('-', lastDash - 1);
      if (secondLastDash > 10) { // Make sure we're past the date part
        const memberName = key.substring(11, secondLastDash);
        if (memberName && memberName.length > 0) {
          membersSet.add(memberName);
        }
      }
    });
    return Array.from(membersSet).sort();
  };

  const allMembers = getAllMembers();
  const getMonthlyStats = () => {
    const months = {};

    // Generate dates for selected year
    const today = new Date();
    const startDate = new Date(`${filterYear}-01-01`);
    const endDate = new Date(`${filterYear}-12-31`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const monthKey = `${yyyy}-${mm}`;

      if (!months[monthKey]) {
        months[monthKey] = { normal: 0, vegetarian: 0, container: 0 };
      }

      ['lunch', 'dinner'].forEach(mealType => {
        const membersToCheck = filterMembers.has('all') ? allMembers : Array.from(filterMembers);

        membersToCheck.forEach(member => {
          const state = meals[`${dateStr}-${member}-${mealType}`] || 'none';
          if (state !== 'none') {
            const dietary = memberDietary[member] || 'Normal';
            const isVegetarian = dietary === 'Vegetarian';

            // Apply diet filter
            if (filterMealType === 'normal' && isVegetarian) return;
            if (filterMealType === 'vegetarian' && !isVegetarian) return;

            if (isVegetarian) {
              months[monthKey].vegetarian++;
            } else {
              months[monthKey].normal++;
            }

            if (state.includes('container')) {
              months[monthKey].container++;
            }
          }
        });
      });
    }

    return months;
  };

  const monthlyStats = getMonthlyStats();
  const monthLabels = Object.keys(monthlyStats).sort();

  const chartData = {
    labels: monthLabels.map(m => {
      const [year, month] = m.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }),
    datasets: [
      {
        label: 'Normal',
        data: monthLabels.map(m => monthlyStats[m].normal),
        color: () => '#4CAF50',
      },
      {
        label: 'Vegetarian',
        data: monthLabels.map(m => monthlyStats[m].vegetarian),
        color: () => '#8BC34A',
      },
    ],
  };

  const maxValue = Math.max(
    ...monthLabels.map(m =>
      monthlyStats[m].normal + monthlyStats[m].vegetarian
    )
  ) || 10;

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.dashboardTitle}>📊 Admin Dashboard</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.dashboardContent}>
        {/* Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filters</Text>

          {/* Year Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Year</Text>
            <View style={styles.filterButtonGroup}>
              {[2024, 2025, 2026].map(year => (
                <TouchableOpacity
                  key={year}
                  style={[styles.filterButton, filterYear === year && styles.filterButtonActive]}
                  onPress={() => setFilterYear(year)}
                >
                  <Text style={[styles.filterButtonText, filterYear === year && styles.filterButtonTextActive]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Diet Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Diet</Text>
            <View style={styles.filterButtonGroup}>
              {['all', 'normal', 'vegetarian'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, filterMealType === type && styles.filterButtonActive]}
                  onPress={() => setFilterMealType(type)}
                >
                  <Text style={[styles.filterButtonText, filterMealType === type && styles.filterButtonTextActive]}>
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Member Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Members</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowMemberDropdown(!showMemberDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {filterMembers.has('all') || filterMembers.size === 0
                  ? 'All Members'
                  : `${filterMembers.size} selected`}
              </Text>
              <Text style={styles.dropdownArrow}>{showMemberDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showMemberDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilterMembers(new Set(['all']));
                  }}
                >
                  <View style={[styles.checkbox, filterMembers.has('all') && styles.checkboxActive]}>
                    {filterMembers.has('all') && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.dropdownItemText}>All Members</Text>
                </TouchableOpacity>

                {allMembers.map(member => (
                  <TouchableOpacity
                    key={member}
                    style={styles.dropdownItem}
                    onPress={() => {
                      const newFilters = new Set(filterMembers);
                      newFilters.delete('all'); // Remove 'all' when selecting specific members
                      if (newFilters.has(member)) {
                        newFilters.delete(member);
                      } else {
                        newFilters.add(member);
                      }
                      setFilterMembers(newFilters.size === 0 ? new Set(['all']) : newFilters);
                    }}
                  >
                    <View style={[styles.checkbox, filterMembers.has(member) && styles.checkboxActive]}>
                      {filterMembers.has(member) && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.dropdownItemText}>{member}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Portions</Text>
          {chartData.labels.length > 0 ? (
            <View style={styles.customChart}>
              {chartData.labels.map((label, idx) => {
                const month = monthLabels[idx];
                const normal = monthlyStats[month].normal;
                const vegetarian = monthlyStats[month].vegetarian;
                const container = monthlyStats[month].container;
                const total = normal + vegetarian + container;
                const chartHeight = total > 0 ? 200 : 50;

                return (
                  <View key={idx} style={styles.chartBar}>
                    <View style={styles.barStack}>
                      {normal > 0 && (
                        <View
                          style={[
                            styles.barSegment,
                            {
                              height: (normal / maxValue) * chartHeight,
                              backgroundColor: '#4CAF50',
                            },
                          ]}
                        >
                          <Text style={styles.barLabel}>{normal}</Text>
                        </View>
                      )}
                      {vegetarian > 0 && (
                        <View
                          style={[
                            styles.barSegment,
                            {
                              height: (vegetarian / maxValue) * chartHeight,
                              backgroundColor: '#8BC34A',
                            },
                          ]}
                        >
                          <Text style={styles.barLabel}>{vegetarian}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.monthLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Normal portions</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8BC34A' }]} />
            <Text style={styles.legendText}>Vegetarian portions</Text>
          </View>
          <Text style={styles.legendNote}>Note: Containers are included in their respective diet type</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  // Firebase hooks
  const { meals: fbMeals, loading: fbMealsLoading, saveMeal } = useFirebaseMeals();
  const { members: fbMembers, memberDietary: fbDietary, loading: fbMembersLoading, addMember: fbAddMember, removeMember: fbRemoveMember } = useFirebaseMembers();

  // Auth
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMember, setCurrentMember] = useState('');
  const [currentScreen, setCurrentScreen] = useState('schedule'); // 'schedule', 'dashboard', 'members', or 'settings'
  const autoLoginAttemptedRef = useRef(false);

  // Local state (synced from Firebase)
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [memberDietary, setMemberDietary] = useState(DIETARY_RESTRICTIONS);
  const [historicalMembers, setHistoricalMembers] = useState(new Set());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDietary, setNewMemberDietary] = useState(DIETARY_OPTIONS[0]);

  // Sync Firebase data to local state
  useEffect(() => {
    if (!fbMembersLoading) {
      // If Firebase members exist, use them; otherwise initialize with sample members
      if (fbMembers.length > 0) {
        setMembers(fbMembers);
        setMemberDietary(fbDietary);
      } else if (members.length > 0 && members[0] === 'Alice') {
        // First time: Firebase is empty, populate it with sample members
        SAMPLE_MEMBERS.forEach(name => {
          const dietary = DIETARY_RESTRICTIONS[name] || 'Normal';
          fbAddMember(name, dietary);
        });
      }
    }
  }, [fbMembers, fbDietary, fbMembersLoading]);

  // Auto-login on app load
  useEffect(() => {
    if (isLoggedIn || autoLoginAttemptedRef.current) return;

    const savedUser = localStorage.getItem('houseMealPlannerUser');
    if (!savedUser) return;

    try {
      const { name: savedName, isAdmin: savedIsAdmin } = JSON.parse(savedUser);

      // For admin, always auto-login
      if (savedIsAdmin === true) {
        autoLoginAttemptedRef.current = true;
        setCurrentMember(savedName);
        setIsAdmin(true);
        setIsLoggedIn(true);
        setName('');
        setPin('');
        setShowPin(false);
        return;
      }

      // For members, wait until members list has loaded
      if (fbMembersLoading || members.length === 0) {
        return;
      }

      autoLoginAttemptedRef.current = true;

      // Check if saved member still exists (use local members state which is synced from Firebase)
      if (members.includes(savedName)) {
        setCurrentMember(savedName);
        setIsAdmin(false);
        setIsLoggedIn(true);
        setName('');
        setPin('');
        setShowPin(false);
      } else {
        localStorage.removeItem('houseMealPlannerUser');
      }
    } catch (e) {
      localStorage.removeItem('houseMealPlannerUser');
    }
  }, [members, fbMembersLoading, isLoggedIn]);

  useEffect(() => {
    if (!fbMealsLoading) {
      setMeals(fbMeals);
    }
  }, [fbMeals, fbMealsLoading]);

  // Meal data: { "YYYY-MM-DD-membername-lunch/dinner": "none" | "normal" | "vegetarian" | "normal+lunchbox" | "vegetarian+lunchbox" }
  const [meals, setMeals] = useState(() => {
    // Generate dummy data for past year
    const dummyMeals = {};
    const today = new Date();

    // Generate data for 365 days in the past
    for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      SAMPLE_MEMBERS.forEach(member => {
        ['lunch', 'dinner'].forEach(mealType => {
          const key = `${dateStr}-${member}-${mealType}`;
          // Random 60% chance of attending
          if (Math.random() < 0.6) {
            const hasContainer = Math.random() < 0.3; // 30% chance of container
            dummyMeals[key] = hasContainer ? 'attending+container' : 'attending';
          }
        });
      });
    }

    return dummyMeals;
  });

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!pin) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    // Check admin credentials
    const isAdminLogin = name === 'Jose' && pin === '1701202026';

    // Check member credentials
    const isMemberLogin = pin === '170120' && members.includes(name);

    if (!isAdminLogin && !isMemberLogin) {
      Alert.alert('Error', 'Invalid name or PIN');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setCurrentMember(name);
      setIsAdmin(isAdminLogin);
      setIsLoggedIn(true);
      setLoading(false);
      // Save login to localStorage for auto-login
      localStorage.setItem('houseMealPlannerUser', JSON.stringify({ name, isAdmin: isAdminLogin }));
    }, 500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setName('');
    setPin('');
    setIsAdmin(false);
    setShowPin(false);
    setCurrentMember('');
    localStorage.removeItem('houseMealPlannerUser');
    autoLoginAttemptedRef.current = false;
  };

  // Generate next 28 days (4 weeks)
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      result.push(`${yyyy}-${mm}-${dd}`);
    }
    return result;
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const suffix = d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th';
    return `${m} ${d}${suffix} ${day}`;
  };

  const getMealState = (dateStr, member, mealType) => {
    const key = `${dateStr}-${member}-${mealType}`;
    return meals[key] || 'none';
  };

  const cycleMealState = (dateStr, member, mealType) => {
    // Enforce permission: only admins or the member themselves can edit
    if (!isAdmin && member !== currentMember) {
      Alert.alert('Error', 'You can only edit your own meal entries');
      return;
    }

    const key = `${dateStr}-${member}-${mealType}`;
    const current = meals[key] || 'none';
    let next = 'none';

    if (current === 'none') next = 'attending';
    else if (current === 'attending') next = 'attending+container';
    else if (current === 'attending+container') next = 'none';

    setMeals(prev => ({
      ...prev,
      [key]: next
    }));

    // Save to Firebase
    saveMeal(dateStr, member, mealType, next);
  };

  if (isLoggedIn) {
    if (currentScreen === 'dashboard') {
      return (
        <AdminDashboard
          meals={meals}
          dates={dates}
          members={members}
          memberDietary={memberDietary}
          historicalMembers={historicalMembers}
          onBack={() => setCurrentScreen('schedule')}
        />
      );
    }

    if (currentScreen === 'members') {
      return (
        <MemberManagement
          members={members}
          memberDietary={memberDietary}
          onAddMember={(name, dietary) => {
            fbAddMember(name, dietary);
          }}
          onRemoveMember={(name) => {
            fbRemoveMember(name);
            setHistoricalMembers(prev => new Set([...prev, name]));
          }}
          onBack={() => setCurrentScreen('schedule')}
        />
      );
    }

    if (currentScreen === 'settings') {
      return (
        <SettingsScreen
          currentMember={currentMember}
          memberDietary={memberDietary}
          isAdmin={isAdmin}
          onBack={() => setCurrentScreen('schedule')}
        />
      );
    }

    return (
      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleHeader}>
          <View>
            <Text style={styles.scheduleTitle}>🏠 Meal Schedule</Text>
            <Text style={styles.scheduleSubtitle}>{currentMember} • {isAdmin ? '👑 Admin' : '👤 Member'}</Text>
          </View>
          <View style={styles.headerButtonsGroup}>
            {isAdmin && (
              <>
                <TouchableOpacity style={styles.summaryBtn} onPress={() => setCurrentScreen('dashboard')}>
                  <Text style={styles.summaryBtnText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.summaryBtn} onPress={() => setCurrentScreen('members')}>
                  <Text style={styles.summaryBtnText}>Members</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.summaryBtn} onPress={() => setCurrentScreen('settings')}>
              <Text style={styles.summaryBtnText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.tableContainer} scrollEventThrottle={16}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Header row with date/meal and member names */}
              <View style={styles.memberHeaderRow}>
                <View style={[styles.headerCell, styles.dateHeaderCell]}>
                  <Text style={styles.headerText}>Date</Text>
                </View>
                <View style={[styles.headerCell, styles.mealTypeHeaderCell]}>
                  <Text style={styles.headerText}>Meal</Text>
                </View>
                {members.map(member => (
                  <View key={member} style={[styles.headerCell, styles.memberHeaderCell]}>
                    <Text style={styles.memberHeaderText}>{member}</Text>
                  </View>
                ))}
              </View>

              {/* Date rows with lunch and dinner */}
              {dates.map(date => (
                <View key={date} style={styles.dateGroup}>
                  {/* Lunch row */}
                  <View style={styles.dateRow}>
                    <View style={[styles.cell, styles.dateCell, styles.dateCellTop]}>
                      <Text style={styles.dateText}>{formatDate(date)}</Text>
                    </View>
                    <View style={[styles.cell, styles.mealTypeCell]}>
                      <Text style={styles.mealTypeText}>Lunch</Text>
                    </View>
                    {members.map(member => (
                      <View key={`${date}-${member}-lunch`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'lunch')}
                          onPress={() => cycleMealState(date, member, 'lunch')}
                          canEdit={isAdmin || member === currentMember}
                        />
                      </View>
                    ))}
                  </View>

                  {/* Dinner row */}
                  <View style={[styles.dateRow, styles.dinnerRow]}>
                    <View style={[styles.cell, styles.dateCell, styles.dateCellBottom]}></View>
                    <View style={[styles.cell, styles.mealTypeCell]}>
                      <Text style={styles.mealTypeText}>Dinner</Text>
                    </View>
                    {members.map(member => (
                      <View key={`${date}-${member}-dinner`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'dinner')}
                          onPress={() => cycleMealState(date, member, 'dinner')}
                          canEdit={isAdmin || member === currentMember}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>

        <Text style={styles.legend}>None → ✓ → ✓+🍱 (Cycle through by tapping)</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🏠 House Meal Planner</Text>
        <Text style={styles.subtitle}>Coordinate household meals</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <Text style={styles.label}>PIN</Text>
        <View style={styles.pinContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry={!showPin}
            editable={!loading}
            maxLength={20}
          />
          <TouchableOpacity onPress={() => setShowPin(!showPin)} disabled={loading} style={styles.eyeBtn}>
            <Text>{showPin ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20, justifyContent: 'center', minHeight: '100%' },
  scheduleContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  scheduleHeader: { backgroundColor: '#2e7d32', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  scheduleTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  scheduleSubtitle: { fontSize: 14, color: '#c8e6c9', marginTop: 4 },
  headerButtonsGroup: { flexDirection: 'row', gap: 8 },
  summaryBtn: { backgroundColor: '#fff', borderRadius: 8, padding: 10, paddingHorizontal: 16 },
  summaryBtnText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },
  tableWrapper: { flex: 1, backgroundColor: '#fff', flexDirection: 'column' },
  tableContainer: { flex: 1, backgroundColor: '#fff' },
  memberHeaderRow: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#4CAF50', backgroundColor: '#f9f9f9' },
  headerCell: { padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#ddd' },
  dateHeaderCell: { width: 70, minHeight: 60 },
  mealTypeHeaderCell: { width: 60, minHeight: 60 },
  memberHeaderCell: { width: 80, minHeight: 60 },
  headerText: { fontSize: 12, fontWeight: '700', color: '#333' },
  memberHeaderText: { fontSize: 12, fontWeight: '700', color: '#333', textAlign: 'center' },
  dietaryBadge: { fontSize: 9, color: '#ff9800', marginTop: 2 },
  dateGroup: {},
  dateRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  dinnerRow: { backgroundColor: '#fafafa' },
  cell: { padding: 6, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  dateCell: { width: 70, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  dateCellTop: { minHeight: 80, borderBottomWidth: 0 },
  dateCellBottom: { minHeight: 40, borderTopWidth: 0 },
  mealTypeCell: { width: 60, minHeight: 40, alignItems: 'center' },
  mealCell: { width: 80, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 11, fontWeight: '600', color: '#333' },
  mealTypeText: { fontSize: 11, fontWeight: '600', color: '#666' },
  mealButton: { width: 60, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  mealButtonText: { fontSize: 13, fontWeight: 'bold', lineHeight: 14 },
  legend: { padding: 12, textAlign: 'center', fontSize: 11, color: '#666', backgroundColor: '#f9f9f9', borderTopWidth: 1, borderTopColor: '#eee' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  pinContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  eyeBtn: { padding: 12 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4 },
  toggleBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#4CAF50' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#666' },
  toggleTextActive: { color: '#fff' },
  helperText: { fontSize: 12, color: '#999', marginTop: 8, fontStyle: 'italic' },
  loginBtn: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  loginBtnDisabled: { backgroundColor: '#ccc' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  logoutBtn: { backgroundColor: '#ff6b6b', borderRadius: 8, padding: 10, paddingHorizontal: 16 },
  logoutBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  dashboardContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  dashboardHeader: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 },
  dashboardTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  backButton: { fontSize: 14, fontWeight: '600', color: '#fff' },
  dashboardContent: { flex: 1, padding: 16 },
  filterCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  filterGroup: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8 },
  filterButtonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterButtonText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterButtonTextActive: { color: '#fff' },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  customChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 250, paddingVertical: 16 },
  chartBar: { alignItems: 'center', flex: 1 },
  barStack: { width: 30, flexDirection: 'column-reverse', borderRadius: 4, overflow: 'hidden' },
  barSegment: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  barLabel: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  monthLabel: { fontSize: 11, fontWeight: '600', color: '#666', marginTop: 8 },
  noDataText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  statsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  statsTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendColor: { width: 16, height: 16, borderRadius: 2, marginRight: 8 },
  legendText: { fontSize: 14, color: '#666' },
  legendNote: { fontSize: 12, color: '#999', marginTop: 8, fontStyle: 'italic' },
  managementContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  managementHeader: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 },
  managementTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  managementContent: { flex: 1, padding: 16 },
  addMemberCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  addMemberTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  dietaryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dietaryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  dietaryOptionActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  dietaryOptionText: { fontSize: 12, fontWeight: '600', color: '#666' },
  dietaryOptionTextActive: { color: '#fff' },
  addButton: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 12, alignItems: 'center' },
  addButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  membersListCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  membersListTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingRight: 8 },
  memberInfo: { flex: 1, marginRight: 8 },
  memberName: { fontSize: 14, fontWeight: '600', color: '#333' },
  memberDietary: { fontSize: 12, color: '#666', marginTop: 2 },
  removeButton: { paddingHorizontal: 16, paddingVertical: 12, minWidth: 40, alignItems: 'center' },
  removeButtonText: { fontSize: 18, fontWeight: 'bold', color: '#ff6b6b' },
  confirmationOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  confirmationBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '80%', maxWidth: 300 },
  confirmationTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  confirmationText: { fontSize: 14, color: '#666', marginBottom: 20 },
  confirmationButtons: { flexDirection: 'row', gap: 8 },
  confirmationButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  removeConfirmButton: { backgroundColor: '#ff6b6b' },
  removeConfirmButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  dropdownButtonText: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  dropdownArrow: { fontSize: 12, color: '#666', marginLeft: 8 },
  dropdownMenu: { marginTop: 4, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#ddd', maxHeight: 300, zIndex: 100 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: '#ddd', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  dropdownItemText: { fontSize: 13, color: '#333' },
  settingsContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  settingsHeader: { backgroundColor: '#4CAF50', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 },
  settingsTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  settingsContent: { flex: 1, padding: 16 },
  settingsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  settingItem: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  settingLabel: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 },
  settingValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  infoText: { fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 20 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8, marginTop: 8 },
  infoBullet: { fontSize: 13, color: '#666', marginBottom: 6, lineHeight: 18 },
  infoBulletNested: { fontSize: 12, color: '#666', marginBottom: 4, marginLeft: 12, lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16 },
  secondaryBtn: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#666' },
});

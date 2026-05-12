import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useFirebaseMeals, useFirebaseMembers, useFirebaseHousehold } from './useFirebase';

const SAMPLE_MEMBERS = ['Alice', 'Bob', 'Sarah', 'John', 'Emma', 'Mike', 'Lisa', 'David', 'Sophie', 'Tom'];
const DIETARY_OPTIONS = ['Normal', 'Vegetarian'];
const DIETARY_RESTRICTIONS = { Alice: 'Vegetarian', Sarah: 'Vegetarian', Emma: 'Normal' };


function MealCell({ state, onPress, canEdit = true }) {
  const getDisplay = () => {
    switch (state) {
      case 'none':
        return { icon: '', bg: canEdit ? COLORS.light : COLORS.muted, text: COLORS.muted };
      case 'attending':
        return { icon: '✓', bg: COLORS.success, text: COLORS.white };
      case 'attending+container':
        return { icon: '✓\n+\n🍱', bg: COLORS.secondary, text: COLORS.white };
      default:
        return { icon: '', bg: canEdit ? COLORS.light : COLORS.muted, text: COLORS.muted };
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
                              backgroundColor: COLORS.secondary,
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
                              backgroundColor: COLORS.accent,
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
            <View style={[styles.legendColor, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.legendText}>Normal portions</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.accent }]} />
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
  const [loginError, setLoginError] = useState('');
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
    setLoginError('');

    if (!name.trim()) {
      setLoginError('Please enter your name');
      return;
    }
    if (!pin) {
      setLoginError('Please enter your PIN');
      return;
    }

    // Check admin credentials
    const isAdminLogin = name === 'José García' && pin === '1701202026';

    // Check member credentials
    const isMemberLogin = pin === '170120' && members.includes(name);

    if (!isAdminLogin && !isMemberLogin) {
      setLoginError('Either name or PIN is incorrect');
      return;
    }

    setLoginError('');
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

  const getDietarySummary = (dateStr, mealType) => {
    const summary = { Normal: 0, Vegetarian: 0, Container: 0 };
    members.forEach(member => {
      const key = `${dateStr}-${member}-${mealType}`;
      const state = meals[key];
      if (state === 'attending' || state === 'attending+container') {
        const diet = memberDietary[member] || 'Normal';
        summary[diet]++;
        if (state === 'attending+container') {
          summary.Container++;
        }
      }
    });
    const parts = [];
    if (summary.Normal > 0) parts.push(`${summary.Normal} normal`);
    if (summary.Vegetarian > 0) parts.push(`${summary.Vegetarian} vegetarian`);
    if (summary.Container > 0) parts.push(`${summary.Container} lunchbox`);
    return parts.join(' + ') || 'None';
  };

  const sortedMembers = useMemo(() => {
    if (!members || members.length === 0) return members;

    const sorted = [...members];
    // Always put the current logged-in member first
    const currentIndex = sorted.findIndex(m => m === currentMember);
    if (currentIndex !== -1 && currentIndex !== 0) {
      const current = sorted.splice(currentIndex, 1);
      sorted.unshift(current[0]);
    }
    return sorted;
  }, [members, currentMember]);

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
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ minWidth: '100%' }}>
            <View style={{ width: '100%' }}>
              {/* Header row with date/meal and member names */}
              <View style={styles.memberHeaderRow}>
                <View style={[styles.headerCell, styles.dateHeaderCell]}>
                  <Text style={styles.headerText}>Date</Text>
                </View>
                <View style={[styles.headerCell, styles.mealTypeHeaderCell]}>
                  <Text style={styles.headerText}>Meal</Text>
                </View>
                {sortedMembers.map(member => (
                  <View key={member} style={[styles.headerCell, styles.memberHeaderCell]}>
                    <Text style={styles.memberHeaderText}>{member}</Text>
                  </View>
                ))}
                <View style={[styles.headerCell, styles.summaryHeaderCell]}>
                  <Text style={styles.headerText}>Summary</Text>
                </View>
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
                    {sortedMembers.map(member => (
                      <View key={`${date}-${member}-lunch`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'lunch')}
                          onPress={() => cycleMealState(date, member, 'lunch')}
                          canEdit={isAdmin || member === currentMember}
                        />
                      </View>
                    ))}
                    <View style={[styles.cell, styles.summaryCell]}>
                      <Text style={styles.summaryText}>{getDietarySummary(date, 'lunch')}</Text>
                    </View>
                  </View>

                  {/* Dinner row */}
                  <View style={[styles.dateRow, styles.dinnerRow]}>
                    <View style={[styles.cell, styles.dateCell, styles.dateCellBottom]}></View>
                    <View style={[styles.cell, styles.mealTypeCell]}>
                      <Text style={styles.mealTypeText}>Dinner</Text>
                    </View>
                    {sortedMembers.map(member => (
                      <View key={`${date}-${member}-dinner`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'dinner')}
                          onPress={() => cycleMealState(date, member, 'dinner')}
                          canEdit={isAdmin || member === currentMember}
                        />
                      </View>
                    ))}
                    <View style={[styles.cell, styles.summaryCell]}>
                      <Text style={styles.summaryText}>{getDietarySummary(date, 'dinner')}</Text>
                    </View>
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
        <View style={styles.pinContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

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

        {loginError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {loginError}</Text>
          </View>
        ) : null}

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

// Typeform-inspired color palette
const COLORS = {
  primary: '#000000',      // Black
  secondary: '#0070F3',    // Strong blue
  accent: '#FF0080',       // Pink
  success: '#0080FF',      // Bright blue
  warning: '#F5A623',      // Orange
  light: '#FAFAFA',        // Almost white
  white: '#FFFFFF',
  dark: '#000000',
  muted: '#999999',        // Gray
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  scrollContent: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  scheduleContainer: { flex: 1, backgroundColor: COLORS.light },
  scheduleHeader: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  scheduleTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.5 },
  scheduleSubtitle: { fontSize: 16, color: COLORS.muted, marginTop: 8, fontWeight: '500' },
  headerButtonsGroup: { flexDirection: 'row', gap: 12 },
  summaryBtn: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, paddingHorizontal: 20, shadowColor: COLORS.dark, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  summaryBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.dark, textAlign: 'center' },
  tableWrapper: { flex: 1, backgroundColor: '#FFFFFF', flexDirection: 'column', width: '100%' },
  tableContainer: { flex: 1, backgroundColor: '#FFFFFF', width: '100%' },
  memberHeaderRow: { flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: COLORS.primary, backgroundColor: '#F0F0F0' },
  headerCell: { padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.muted },
  dateHeaderCell: { width: 90, minHeight: 60, flexShrink: 0 },
  mealTypeHeaderCell: { width: 50, minHeight: 60, flexShrink: 0 },
  memberHeaderCell: { flex: 1, minHeight: 60 },
  headerText: { fontSize: 11, fontWeight: '700', color: COLORS.dark },
  memberHeaderText: { fontSize: 10, fontWeight: '700', color: COLORS.dark, textAlign: 'center' },
  dietaryBadge: { fontSize: 8, color: COLORS.warning, marginTop: 2 },
  dateGroup: {},
  dateRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dinnerRow: { backgroundColor: '#F8F8F8' },
  cell: { padding: 4, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.light },
  dateCell: { width: 90, minHeight: 40, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dateCellTop: { minHeight: 40, borderBottomWidth: 0 },
  dateCellBottom: { minHeight: 40, borderTopWidth: 0 },
  mealTypeCell: { width: 50, minHeight: 40, alignItems: 'center', flexShrink: 0 },
  mealCell: { flex: 1, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 11, fontWeight: '600', color: COLORS.dark },
  mealTypeText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  mealButton: { width: '100%', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 0, shadowColor: COLORS.dark, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  mealButtonText: { fontSize: 14, fontWeight: '800', lineHeight: 14, color: COLORS.white },
  summaryHeaderCell: { width: 120, minHeight: 60, flexShrink: 0 },
  summaryCell: { width: 120, minHeight: 40, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  summaryText: { fontSize: 10, fontWeight: '600', color: COLORS.dark, textAlign: 'center' },
  legend: { padding: 12, textAlign: 'center', fontSize: 11, color: COLORS.muted, backgroundColor: COLORS.light, borderTopWidth: 1, borderTopColor: COLORS.light },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.muted },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 32, marginBottom: 24, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 2, borderColor: COLORS.light, borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: COLORS.light, color: COLORS.dark, fontWeight: '500' },
  pinContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.muted, borderRadius: 8 },
  eyeBtn: { padding: 12 },
  errorBox: { backgroundColor: '#FFE5E5', borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF4444' },
  errorText: { fontSize: 14, fontWeight: '600', color: '#CC0000' },
  toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.light, borderRadius: 8, padding: 4 },
  toggleBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: COLORS.success },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  toggleTextActive: { color: COLORS.white },
  helperText: { fontSize: 12, color: COLORS.muted, marginTop: 8, fontStyle: 'italic' },
  loginBtn: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32, shadowColor: COLORS.secondary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  loginBtnDisabled: { backgroundColor: COLORS.muted, shadowOpacity: 0 },
  loginBtnText: { fontSize: 18, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  logoutBtn: { backgroundColor: COLORS.accent, borderRadius: 12, padding: 12, paddingHorizontal: 20, shadowColor: COLORS.accent, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  dashboardContainer: { flex: 1, backgroundColor: COLORS.light },
  dashboardHeader: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dashboardTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.5 },
  backButton: { fontSize: 16, fontWeight: '700', color: COLORS.secondary },
  dashboardContent: { flex: 1, padding: 24 },
  filterCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: COLORS.dark, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  filterTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },
  filterGroup: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 8 },
  filterButtonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.light, borderWidth: 2, borderColor: COLORS.light },
  filterButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterButtonText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  filterButtonTextActive: { color: COLORS.white },
  chartCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  customChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 250, paddingVertical: 16 },
  chartBar: { alignItems: 'center', flex: 1 },
  barStack: { width: 30, flexDirection: 'column-reverse', borderRadius: 4, overflow: 'hidden' },
  barSegment: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  barLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  monthLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted, marginTop: 8 },
  noDataText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', paddingVertical: 20 },
  statsCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, elevation: 2 },
  statsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendColor: { width: 16, height: 16, borderRadius: 2, marginRight: 8 },
  legendText: { fontSize: 14, color: COLORS.muted },
  legendNote: { fontSize: 12, color: COLORS.muted, marginTop: 8, fontStyle: 'italic' },
  managementContainer: { flex: 1, backgroundColor: COLORS.light },
  managementHeader: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  managementTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.5 },
  managementContent: { flex: 1, padding: 24 },
  addMemberCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: COLORS.dark, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  addMemberTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },
  dietaryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dietaryOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.light, borderWidth: 2, borderColor: COLORS.light },
  dietaryOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dietaryOptionText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  dietaryOptionTextActive: { color: COLORS.white },
  addButton: { backgroundColor: COLORS.success, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: COLORS.success, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  addButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  membersListCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, shadowColor: COLORS.dark, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  membersListTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 16 },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.light, paddingRight: 8 },
  memberInfo: { flex: 1, marginRight: 8 },
  memberName: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  memberDietary: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  removeButton: { paddingHorizontal: 16, paddingVertical: 12, minWidth: 40, alignItems: 'center' },
  removeButtonText: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  confirmationOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  confirmationBox: { backgroundColor: COLORS.white, borderRadius: 16, padding: 28, width: '80%', maxWidth: 320, shadowColor: COLORS.dark, shadowOpacity: 0.2, shadowRadius: 16, elevation: 5 },
  confirmationTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  confirmationText: { fontSize: 14, color: COLORS.muted, marginBottom: 24, lineHeight: 20 },
  confirmationButtons: { flexDirection: 'row', gap: 12 },
  confirmationButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelButton: { backgroundColor: COLORS.light, borderWidth: 2, borderColor: COLORS.light },
  cancelButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  removeConfirmButton: { backgroundColor: COLORS.accent },
  removeConfirmButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, backgroundColor: COLORS.light, borderWidth: 1, borderColor: COLORS.muted },
  dropdownButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.dark, flex: 1 },
  dropdownArrow: { fontSize: 12, color: COLORS.muted, marginLeft: 8 },
  dropdownMenu: { marginTop: 4, backgroundColor: COLORS.white, borderRadius: 6, borderWidth: 1, borderColor: COLORS.muted, maxHeight: 300, zIndex: 100 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: COLORS.muted, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkmark: { fontSize: 12, color: COLORS.white, fontWeight: 'bold' },
  dropdownItemText: { fontSize: 13, color: COLORS.dark },
  settingsContainer: { flex: 1, backgroundColor: COLORS.light },
  settingsHeader: { backgroundColor: COLORS.primary, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 },
  settingsTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  settingsContent: { flex: 1, padding: 16 },
  settingsCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  settingItem: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  settingLabel: { fontSize: 12, fontWeight: '600', color: COLORS.muted, marginBottom: 4 },
  settingValue: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  infoText: { fontSize: 14, color: COLORS.muted, marginBottom: 8, lineHeight: 20 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: COLORS.dark, marginBottom: 8, marginTop: 8 },
  infoBullet: { fontSize: 13, color: COLORS.muted, marginBottom: 6, lineHeight: 18 },
  infoBulletNested: { fontSize: 12, color: COLORS.muted, marginBottom: 4, marginLeft: 12, lineHeight: 16 },
  divider: { height: 1, backgroundColor: COLORS.light, marginVertical: 12 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 16 },
  secondaryBtn: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#666' },
});

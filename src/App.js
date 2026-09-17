import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useFirebaseMeals, useFirebaseMembers, useFirebaseHousehold, useFirebaseGuests } from './hooks/useFirebase';

const DIETARY_OPTIONS = ['Normal', 'Vegetarian'];

const translateDiet = (diet) => (diet === 'Vegetarian' ? 'Vegetarisch' : 'Normal');


function MealCell({ state, onPress, canEdit = true }) {
  const getDisplay = () => {
    switch (state) {
      case 'none':
        return { icon: '', bg: canEdit ? COLORS.light : COLORS.muted, text: COLORS.muted };
      case 'attending':
        return { icon: '✓', bg: COLORS.success, text: COLORS.white };
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
          <Text style={styles.backButton}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>⚙️ Einstellungen</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.settingsContent}>
        {/* Profile Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Profil</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{currentMember}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Kontotyp</Text>
            <Text style={styles.settingValue}>{isAdmin ? '👑 Admin' : '👤 Mitglied'}</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Ernährungspräferenz</Text>
            <Text style={styles.settingValue}>{translateDiet(memberDietary[currentMember] || 'Normal')}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Über</Text>

          <Text style={styles.infoText}>
            Feldmark | Essenplanung v1.0
          </Text>
          <Text style={styles.infoText}>
            Haushaltsessen koordinieren und Ernährungspräferenzen verfolgen.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>So funktioniert's:</Text>
          <Text style={styles.infoBullet}>• Tippe auf die Essenszellen zum Umschalten:</Text>
          <Text style={styles.infoBulletNested}>  ☐ Nimmt nicht am Essen teil</Text>
          <Text style={styles.infoBulletNested}>  ✓ Nimmt am Essen teil</Text>
          <Text style={styles.infoBullet}>• Admins können Mitglieder verwalten und Auswertungen einsehen</Text>
          <Text style={styles.infoBullet}>• Mitglieder können nur ihre eigenen Einträge bearbeiten</Text>
          <Text style={styles.infoBullet}>• Verlaufsdaten werden für Auswertungen aufbewahrt</Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Kurztipps</Text>
          <Text style={styles.infoBullet}>✓ = Nimmt am Essen teil</Text>
          <Text style={styles.infoBullet}>Die Ernährung wird beim Hinzufügen von Mitgliedern festgelegt</Text>
          <Text style={styles.infoBullet}>Die Übersicht zeigt monatliche Essensauswertungen</Text>
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
      Alert.alert('Fehler', 'Bitte gib einen Namen für das Mitglied ein');
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
          <Text style={styles.backButton}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.managementTitle}>👥 Mitgliederverwaltung</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.managementContent} scrollEventThrottle={16}>
        {/* Add Member Section */}
        <View style={styles.addMemberCard}>
          <Text style={styles.addMemberTitle}>Neues Mitglied hinzufügen</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Namen des Mitglieds eingeben"
            value={newName}
            onChangeText={setNewName}
          />

          <Text style={styles.label}>Ernährung</Text>
          <View style={styles.dietaryOptions}>
            {DIETARY_OPTIONS.map(diet => (
              <TouchableOpacity
                key={diet}
                style={[styles.dietaryOption, newDietary === diet && styles.dietaryOptionActive]}
                onPress={() => setNewDietary(diet)}
              >
                <Text style={[styles.dietaryOptionText, newDietary === diet && styles.dietaryOptionTextActive]}>
                  {translateDiet(diet)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <Text style={styles.addButtonText}>+ Mitglied hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Members List */}
        <View style={styles.membersListCard} pointerEvents="auto">
          <Text style={styles.membersListTitle}>Aktuelle Mitglieder ({members.length})</Text>

          {members.map(member => (
            <View key={member} style={styles.memberItem} pointerEvents="auto">
              <View style={styles.memberInfo} pointerEvents="none">
                <Text style={styles.memberName}>{member}</Text>
                {memberDietary[member] && memberDietary[member] !== 'Normal' && (
                  <Text style={styles.memberDietary}>{translateDiet(memberDietary[member])}</Text>
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
        <Modal
          visible={!!removingMember}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRemovingMember(null)}
        >
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationTitle}>Mitglied entfernen?</Text>
              <Text style={styles.confirmationText}>Bist du sicher, dass du {removingMember} entfernen möchtest?</Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.cancelButton]}
                  onPress={() => setRemovingMember(null)}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.removeConfirmButton]}
                  onPress={() => {
                    onRemoveMember(removingMember);
                    setRemovingMember(null);
                  }}
                >
                  <Text style={styles.removeConfirmButtonText}>Entfernen</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

function ManageGuests({ dates, guestsByDateMeal, onAddGuest, onRemoveGuest, onBack, formatDate }) {
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [newGuestName, setNewGuestName] = useState('');

  const key = `${selectedDate}-${selectedMeal}`;
  const guestsForSelection = guestsByDateMeal[key] || [];

  const handleAddGuest = () => {
    const trimmed = newGuestName.trim();
    if (!trimmed) return;
    onAddGuest(selectedDate, selectedMeal, trimmed);
    setNewGuestName('');
  };

  return (
    <View style={styles.managementContainer}>
      <View style={styles.managementHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.managementTitle}>🎉 Gäste verwalten</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.managementContent} scrollEventThrottle={16}>
        <View style={styles.addMemberCard}>
          <Text style={styles.label}>Datum</Text>
          <input
            type="date"
            value={selectedDate}
            min={dates[0]}
            max={dates[dates.length - 1]}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              borderWidth: 2,
              borderColor: COLORS.light,
              borderRadius: 12,
              padding: 14,
              fontSize: 16,
              backgroundColor: COLORS.light,
              color: COLORS.dark,
              fontWeight: '500',
              width: '100%',
              marginBottom: 16,
              fontFamily: 'inherit',
            }}
          />

          <Text style={styles.label}>Essen</Text>
          <View style={styles.dietaryOptions}>
            {['lunch', 'dinner'].map(meal => (
              <TouchableOpacity
                key={meal}
                style={[styles.dietaryOption, selectedMeal === meal && styles.dietaryOptionActive]}
                onPress={() => setSelectedMeal(meal)}
              >
                <Text style={[styles.dietaryOptionText, selectedMeal === meal && styles.dietaryOptionTextActive]}>
                  {meal === 'lunch' ? 'Mittag' : 'Abend'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Gastname</Text>
          <TextInput
            style={styles.input}
            placeholder="Namen des Gasts eingeben"
            value={newGuestName}
            onChangeText={setNewGuestName}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddGuest}>
            <Text style={styles.addButtonText}>+ Gast hinzufügen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersListCard}>
          <Text style={styles.membersListTitle}>
            Gäste für {formatDate(selectedDate)} ({selectedMeal === 'lunch' ? 'Mittag' : 'Abend'})
          </Text>
          {guestsForSelection.length === 0 ? (
            <Text style={styles.infoBullet}>Keine Gäste für diesen Termin</Text>
          ) : (
            guestsForSelection.map(name => (
              <View key={name} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  activeOpacity={0.6}
                  onPress={() => onRemoveGuest(selectedDate, selectedMeal, name)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
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

  const availableYears = (() => {
    const years = new Set();
    Object.keys(meals).forEach(key => {
      const year = parseInt(key.substring(0, 4));
      if (!isNaN(year)) years.add(year);
    });
    const sorted = Array.from(years).sort();
    return sorted.length > 0 ? sorted : [new Date().getFullYear()];
  })();

  const getMonthlyStats = () => {
    const months = {};

    const today = new Date();
    const startDate = new Date(`${filterYear}-01-01`);
    const endDate = filterYear === today.getFullYear() ? today : new Date(`${filterYear}-12-31`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const monthKey = `${yyyy}-${mm}`;

      if (!months[monthKey]) {
        months[monthKey] = { normal: 0, vegetarian: 0 };
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
          }
        });
      });
    }

    return months;
  };

  const monthlyStats = getMonthlyStats();
  const monthLabels = Object.keys(monthlyStats).sort().filter(m =>
    monthlyStats[m].normal + monthlyStats[m].vegetarian > 0
  );

  const chartData = {
    labels: monthLabels.map(m => {
      const [year, month] = m.split('-');
      const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }),
    datasets: [
      {
        label: 'Normal',
        data: monthLabels.map(m => monthlyStats[m].normal),
        color: () => '#4CAF50',
      },
      {
        label: 'Vegetarisch',
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
          <Text style={styles.backButton}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.dashboardTitle}>📊 Admin-Übersicht</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.dashboardContent}>
        {/* Filters */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter</Text>

          {/* Year Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Jahr</Text>
            <View style={styles.filterButtonGroup}>
              {availableYears.map(year => (
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
            <Text style={styles.filterLabel}>Ernährung</Text>
            <View style={styles.filterButtonGroup}>
              {['all', 'normal', 'vegetarian'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, filterMealType === type && styles.filterButtonActive]}
                  onPress={() => setFilterMealType(type)}
                >
                  <Text style={[styles.filterButtonText, filterMealType === type && styles.filterButtonTextActive]}>
                    {type === 'all' ? 'Alle' : type === 'vegetarian' ? 'Vegetarisch' : 'Normal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Member Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Mitglieder</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowMemberDropdown(!showMemberDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {filterMembers.has('all') || filterMembers.size === 0
                  ? 'Alle Mitglieder'
                  : `${filterMembers.size} ausgewählt`}
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
                  <Text style={styles.dropdownItemText}>Alle Mitglieder</Text>
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
          <Text style={styles.chartTitle}>Monatliche Portionen</Text>
          {chartData.labels.length > 0 ? (
            <View>
              <View style={styles.customChart}>
                {chartData.labels.map((label, idx) => {
                  const month = monthLabels[idx];
                  const normal = monthlyStats[month].normal;
                  const vegetarian = monthlyStats[month].vegetarian;
                  const total = normal + vegetarian;
                  const normH = total > 0 ? (normal / maxValue) * 200 : 0;
                  const vegH  = total > 0 ? (vegetarian / maxValue) * 200 : 0;

                  return (
                    <View key={idx} style={styles.chartBarCol}>
                      <Text style={styles.barTotalLabel}>{total > 0 ? total : ' '}</Text>
                      <View style={styles.barStack}>
                        {total === 0 ? (
                          <View style={styles.barFallow} />
                        ) : (
                          <>
                            {vegetarian > 0 && (
                              <View style={[styles.barSegment, {
                                height: vegH,
                                backgroundColor: COLORS.success,
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                              }]} />
                            )}
                            {normal > 0 && (
                              <View style={[styles.barSegment, {
                                height: normH,
                                backgroundColor: COLORS.secondary,
                                ...(vegetarian === 0 && { borderTopLeftRadius: 5, borderTopRightRadius: 5 }),
                              }]} />
                            )}
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartBaseline} />
              <View style={styles.chartLabelsRow}>
                {chartData.labels.map((label, idx) => (
                  <Text key={idx} style={[styles.monthLabel, { flex: 1, textAlign: 'center' }]}>{label}</Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Keine Daten verfügbar</Text>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Legende</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.legendText}>Normale Portionen</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Vegetarische Portionen</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  // Firebase hooks
  const { meals: fbMeals, loading: fbMealsLoading, saveMeal } = useFirebaseMeals();
  const { members: fbMembers, memberDietary: fbDietary, loading: fbMembersLoading, addMember: fbAddMember, removeMember: fbRemoveMember } = useFirebaseMembers();
  const { guestsByDateMeal, addGuest, removeGuest } = useFirebaseGuests();

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
  const [members, setMembers] = useState([]);
  const [memberDietary, setMemberDietary] = useState({});
  const [historicalMembers, setHistoricalMembers] = useState(new Set());
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDietary, setNewMemberDietary] = useState(DIETARY_OPTIONS[0]);

  // Sync Firebase data to local state
  useEffect(() => {
    if (!fbMembersLoading) {
      if (fbMembers.length > 0) {
        setMembers(fbMembers);
        setMemberDietary(fbDietary);
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

      // For admin, always auto-login (no member list needed)
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

      // Wait until Firebase members have loaded before checking
      if (fbMembersLoading) return;

      autoLoginAttemptedRef.current = true;

      // Check against fbMembers (Firebase data) not local state which may lag behind
      if (fbMembers.includes(savedName)) {
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
  }, [fbMembers, fbMembersLoading, isLoggedIn]);

  useEffect(() => {
    if (!fbMealsLoading) {
      setMeals(fbMeals);
    }
  }, [fbMeals, fbMealsLoading]);

  const [meals, setMeals] = useState({});

  const handleLogin = async () => {
    setLoginError('');

    if (!name.trim()) {
      setLoginError('Bitte gib deinen Namen ein');
      return;
    }
    if (!pin) {
      setLoginError('Bitte gib deine PIN ein');
      return;
    }

    // Check admin credentials
    const isAdminLogin = name === 'José García' && pin === '1701202026';

    // Check member credentials
    const isMemberLogin = pin === '170120' && members.includes(name);

    if (!isAdminLogin && !isMemberLogin) {
      setLoginError('Name oder PIN ist falsch');
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
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const day = days[date.getDay()];
    const d = date.getDate();
    const m = months[date.getMonth()];
    return `${d}. ${m} ${day}`;
  };

  const getMealState = (dateStr, member, mealType) => {
    const key = `${dateStr}-${member}-${mealType}`;
    return meals[key] || 'none';
  };

  const getDietarySummary = (dateStr, mealType) => {
    const summary = { Normal: 0, Vegetarian: 0 };
    members.forEach(member => {
      const key = `${dateStr}-${member}-${mealType}`;
      const state = meals[key];
      if (state === 'attending') {
        const diet = memberDietary[member] || 'Normal';
        summary[diet]++;
      }
    });
    const parts = [];
    if (summary.Normal > 0) parts.push(`${summary.Normal} normal`);
    if (summary.Vegetarian > 0) parts.push(`${summary.Vegetarian} vegetarisch`);
    const guestNames = guestsByDateMeal[`${dateStr}-${mealType}`] || [];
    if (guestNames.length > 0) parts.push(`${guestNames.length} Gast (${guestNames.join(' + ')})`);
    return parts.join(' + ') || 'Keine';
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

  const canEditMember = (member) => isAdmin || member === currentMember || member.toLowerCase().includes('gast');

  const cycleMealState = (dateStr, member, mealType) => {
    // Enforce permission: admins, the member themselves, or anyone for guest columns
    if (!canEditMember(member)) {
      Alert.alert('Fehler', 'Du kannst nur deine eigenen Einträge bearbeiten');
      return;
    }

    const key = `${dateStr}-${member}-${mealType}`;
    const current = meals[key] || 'none';
    let next = 'none';

    if (current === 'none') next = 'attending';
    else if (current === 'attending') next = 'none';

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

    if (currentScreen === 'guests') {
      return (
        <ManageGuests
          dates={dates}
          guestsByDateMeal={guestsByDateMeal}
          onAddGuest={addGuest}
          onRemoveGuest={removeGuest}
          onBack={() => setCurrentScreen('schedule')}
          formatDate={formatDate}
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
          <View style={styles.scheduleHeaderTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleTitle}>🏠 Essensplan</Text>
              <Text style={styles.scheduleSubtitle}>{currentMember} • {isAdmin ? '👑 Admin' : '👤 Mitglied'}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Abmelden</Text>
            </TouchableOpacity>
          </View>
          {isAdmin && (
            <View style={styles.headerButtonsGroup}>
              <TouchableOpacity style={styles.adminNavBtn} onPress={() => setCurrentScreen('dashboard')}>
                <Text style={styles.adminNavBtnText}>Übersicht</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminNavBtn} onPress={() => setCurrentScreen('members')}>
                <Text style={styles.adminNavBtnText}>Mitglieder</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adminNavBtn} onPress={() => setCurrentScreen('guests')}>
                <Text style={styles.adminNavBtnText}>Gäste</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsNavBtn} onPress={() => setCurrentScreen('settings')}>
                <Text style={styles.settingsNavBtnText}>⚙</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isAdmin && (
            <View style={styles.headerButtonsGroup}>
              <TouchableOpacity style={styles.adminNavBtn} onPress={() => setCurrentScreen('guests')}>
                <Text style={styles.adminNavBtnText}>Gäste</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsNavBtn} onPress={() => setCurrentScreen('settings')}>
                <Text style={styles.settingsNavBtnText}>⚙</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView style={styles.tableContainer} scrollEventThrottle={16}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ minWidth: '100%' }}>
            <View style={{ width: '100%' }}>
              {/* Header row with date/meal and member names */}
              <View style={styles.memberHeaderRow}>
                <View style={[styles.headerCell, styles.dateHeaderCell]}>
                  <Text style={styles.headerText}>Datum</Text>
                </View>
                <View style={[styles.headerCell, styles.mealTypeHeaderCell]}>
                  <Text style={styles.headerText}>Essen</Text>
                </View>
                {sortedMembers.map(member => (
                  <View key={member} style={[styles.headerCell, styles.memberHeaderCell]}>
                    <Text style={styles.memberHeaderText}>{member}</Text>
                  </View>
                ))}
                <View style={[styles.headerCell, styles.summaryHeaderCell]}>
                  <Text style={styles.headerText}>Zusammenfassung</Text>
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
                      <Text style={styles.mealTypeText}>Mittag</Text>
                    </View>
                    {sortedMembers.map(member => (
                      <View key={`${date}-${member}-lunch`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'lunch')}
                          onPress={() => cycleMealState(date, member, 'lunch')}
                          canEdit={canEditMember(member)}
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
                      <Text style={styles.mealTypeText}>Abend</Text>
                    </View>
                    {sortedMembers.map(member => (
                      <View key={`${date}-${member}-dinner`} style={[styles.cell, styles.mealCell]}>
                        <MealCell
                          state={getMealState(date, member, 'dinner')}
                          onPress={() => cycleMealState(date, member, 'dinner')}
                          canEdit={canEditMember(member)}
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

        <Text style={styles.legend}>⬜ Keine  →  ✓ Dabei  — zum Umschalten tippen</Text>
      </View>
    );
  }

  return (
    <View style={styles.loginRoot}>
      <View style={styles.loginHero}>
        <Text style={styles.loginHeroEmoji}>🏠</Text>
        <Text style={styles.loginHeroTitle}>Haus-Essensplaner</Text>
        <Text style={styles.loginHeroSubtitle}>Haushaltsessen koordinieren</Text>
      </View>

      <ScrollView
        style={styles.loginFormPanel}
        contentContainerStyle={styles.loginFormContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.loginCardHeading}>Willkommen zurück</Text>

        <Text style={styles.loginFieldLabel}>Dein Name</Text>
        <TextInput
          style={styles.loginTextInput}
          placeholder="Namen eingeben"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <Text style={styles.loginFieldLabel}>PIN</Text>
        <View style={styles.loginPinWrapper}>
          <TextInput
            style={styles.loginPinInput}
            placeholder="PIN eingeben"
            placeholderTextColor={COLORS.muted}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry={!showPin}
            editable={!loading}
            maxLength={20}
          />
          <TouchableOpacity onPress={() => setShowPin(!showPin)} disabled={loading} style={styles.loginEyeBtn}>
            <Text style={styles.loginEyeIcon}>{showPin ? '👁️' : '🔒'}</Text>
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
          <Text style={styles.loginBtnText}>{loading ? 'Anmeldung läuft...' : 'Anmelden'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

// Botanical Garden–influenced palette: blue brand, fresh green for food/attending, warm muted
const COLORS = {
  primary: '#1a2e25',      // Deep forest
  secondary: '#4a7c59',    // Fern green
  accent: '#b7472a',       // Terracotta
  success: '#6aab78',      // Garden green (attending)
  warning: '#f9a620',      // Marigold
  light: '#f5f3ed',        // Cream
  white: '#ffffff',
  dark: '#1a2e25',         // Deep forest text
  muted: '#8a9e8f',        // Sage gray
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  scrollContent: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  scheduleContainer: { flex: 1, backgroundColor: COLORS.light },
  scheduleHeader: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16, flexDirection: 'column', shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  scheduleHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  scheduleTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.5 },
  scheduleSubtitle: { fontSize: 16, color: COLORS.muted, marginTop: 8, fontWeight: '500' },
  headerButtonsGroup: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  summaryBtn: { backgroundColor: COLORS.white, borderRadius: 12, padding: 12, paddingHorizontal: 20, shadowColor: COLORS.dark, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  summaryBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.dark, textAlign: 'center' },
  tableWrapper: { flex: 1, backgroundColor: '#FFFFFF', flexDirection: 'column', width: '100%' },
  tableContainer: { flex: 1, backgroundColor: '#FFFFFF', width: '100%' },
  memberHeaderRow: { flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: COLORS.primary, backgroundColor: '#F0F0F0' },
  headerCell: { padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.muted },
  dateHeaderCell: { width: 115, minHeight: 60, flexShrink: 0 },
  mealTypeHeaderCell: { width: 50, minHeight: 60, flexShrink: 0 },
  memberHeaderCell: { flex: 1, minHeight: 60 },
  headerText: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  memberHeaderText: { fontSize: 13, fontWeight: '700', color: COLORS.dark, textAlign: 'center' },
  dietaryBadge: { fontSize: 8, color: COLORS.warning, marginTop: 2 },
  dateGroup: {},
  dateRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dinnerRow: { backgroundColor: '#F8F8F8' },
  cell: { padding: 4, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.light },
  dateCell: { width: 115, minHeight: 40, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dateCellTop: { minHeight: 40, borderBottomWidth: 0 },
  dateCellBottom: { minHeight: 40, borderTopWidth: 0 },
  mealTypeCell: { width: 50, minHeight: 40, alignItems: 'center', flexShrink: 0 },
  mealCell: { flex: 1, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  mealTypeText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  mealButton: { width: '100%', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 0, shadowColor: COLORS.dark, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  mealButtonText: { fontSize: 14, fontWeight: '800', lineHeight: 14, color: COLORS.white },
  summaryHeaderCell: { width: 120, minHeight: 60, flexShrink: 0 },
  summaryCell: { width: 120, minHeight: 40, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  summaryText: { fontSize: 12, fontWeight: '600', color: COLORS.dark, textAlign: 'center' },
  legend: { padding: 14, textAlign: 'center', fontSize: 12, color: COLORS.dark, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#D0D0D0', fontWeight: '600', letterSpacing: 0.2 },
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
  logoutBtn: { backgroundColor: COLORS.accent, borderRadius: 10, height: 36, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.accent, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  logoutBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  dashboardContainer: { flex: 1, backgroundColor: COLORS.light },
  dashboardHeader: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dashboardTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.3, marginLeft: 16 },
  backButton: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, flexShrink: 0 },
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
  customChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 230, paddingTop: 24, paddingBottom: 0 },
  chartBar: { alignItems: 'center', flex: 1 },
  chartBarCol: { alignItems: 'center', flex: 1 },
  barStack: { width: 28, flexDirection: 'column-reverse' },
  barSegment: { width: '100%' },
  barLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  barTotalLabel: { fontSize: 8, fontWeight: '700', color: COLORS.dark, marginBottom: 3 },
  barFallow: { width: '100%', height: 5, backgroundColor: '#E4E4E2', borderRadius: 2 },
  chartBaseline: { height: 1.5, backgroundColor: COLORS.dark, marginTop: 0 },
  chartLabelsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 2 },
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
  managementTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.3, marginLeft: 16 },
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
  settingsHeader: { backgroundColor: COLORS.white, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, shadowColor: COLORS.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  settingsTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark, letterSpacing: -0.3, marginLeft: 16 },
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
  // Nav button variants for schedule header
  adminNavBtn: { backgroundColor: COLORS.secondary, borderRadius: 10, height: 36, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.secondary, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  adminNavBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  settingsNavBtn: { backgroundColor: COLORS.white, borderRadius: 10, height: 36, width: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#D8D8D8' },
  settingsNavBtnText: { fontSize: 15, color: COLORS.dark, textAlign: 'center' },
  // Login screen redesign
  loginRoot: { flex: 1, backgroundColor: COLORS.secondary },
  loginHero: { paddingTop: 64, paddingBottom: 44, paddingHorizontal: 32, alignItems: 'center' },
  loginHeroEmoji: { fontSize: 52, marginBottom: 18 },
  loginHeroTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5, textAlign: 'center', marginBottom: 10 },
  loginHeroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  loginFormPanel: { flex: 1, backgroundColor: COLORS.light, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  loginFormContent: { padding: 28, paddingBottom: 48 },
  loginCardHeading: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 28, letterSpacing: -0.3 },
  loginFieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2 },
  loginTextInput: { borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: COLORS.white, color: COLORS.dark, fontWeight: '500', marginBottom: 20 },
  loginPinWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, backgroundColor: COLORS.white, marginBottom: 20 },
  loginPinInput: { flex: 1, padding: 14, fontSize: 16, color: COLORS.dark, fontWeight: '500' },
  loginEyeBtn: { padding: 14 },
  loginEyeIcon: { fontSize: 16 },
});
